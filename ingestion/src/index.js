require("dotenv").config();
const express = require("express");
const { Queue } = require("bullmq");
const Joi = require("joi");
const IORedis = require("ioredis");

const app = express();
app.use(express.json());

const redisConnection = new IORedis(
  process.env.REDIS_URL || "redis://127.0.0.1:6379"
);
const eventQueue = new Queue("events", { connection: redisConnection });

const schema = Joi.object({
  site_id: Joi.string().required(),
  event_type: Joi.string().required(),
  path: Joi.string().required(),
  user_id: Joi.string().allow(null, ""),
  timestamp: Joi.string().isoDate().required(),
});

app.post("/event", async (req, res) => {
  const { error, value } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  await eventQueue.add("ingest", value, {
    removeOnComplete: true,
    removeOnFail: true,
  });
  res.status(200).json({ status: "ok" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log("Ingestion listening on", port));
