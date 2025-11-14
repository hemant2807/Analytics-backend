require("dotenv").config();
const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { Pool } = require("pg");

const redisConnection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function saveEventToDB(evt) {
  const query = `
    INSERT INTO events(site_id, event_type, path, user_id, timestamp)
    VALUES($1,$2,$3,$4,$5)
  `;
  await pool.query(query, [
    evt.site_id,
    evt.event_type,
    evt.path,
    evt.user_id,
    evt.timestamp,
  ]);
}

const worker = new Worker(
  "events",
  async (job) => {
    const evt = job.data;
    try {
      await saveEventToDB(evt);
      return { ok: true };
    } catch (err) {
      console.error("failed processing", err);
      throw err;
    }
  },
  { connection: redisConnection }
);

worker.on("completed", (job) => console.log("job completed", job.id));
worker.on("failed", (job, err) => console.error("job failed", job.id, err));

console.log("Processor worker started");
