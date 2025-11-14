
📊 Analytics Backend — Event Ingestion + Queue + Processing + Reporting
A high-performance backend system for collecting website analytics events, processing them asynchronously through a Redis queue, storing them in Postgres, and providing aggregated reporting.

🚀 Architecture Overview
Client → Ingestion API → Redis Queue → Worker → Postgres → Reporting API

Components
Ingestion API (Express): Accepts events quickly and pushes them to Redis.
Queue (Redis + BullMQ): Handles high-volume asynchronous event ingestion.
Worker (Node.js): Consumes events and writes them to the database.
Database (Postgres): Stores raw events.
Reporting API (Express): Returns aggregated analytics.

📁 Folder Structure
analytics-backend/
├── ingestion/     # POST /event
├── processor/     # Worker saving events to DB
├── reporting/     # GET /stats
└── shared/        # (empty)


⚙️ Tech Stack
Node.js
Express.js
Redis (via WSL)
BullMQ (queue)
Postgres
Joi validation

🛠️ Setup Instructions
1. Install dependencies
Run inside each folder:
npm install

2. Start Redis (WSL)
sudo service redis-server start
redis-cli ping   # PONG

3. Create Postgres DB
CREATE DATABASE analytics;

CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_events_site_date ON events (site_id, (DATE(timestamp)));

4. Start the services
Ingestion
cd ingestion
npm start

Processor
cd processor
npm start

Reporting
cd reporting
npm start


🧪 Testing
Send event
```bash
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d "{\"site_id\":\"demo\",\"event_type\":\"view\",\"path\":\"/\",\"user_id\":\"u1\",\"timestamp\":\"2025-11-14T10:00:00Z\"}"
```

Fetch analytics
```bash
curl "http://localhost:4000/stats?site_id=demo"
```

Expected:
```json
{
  "site_id":"demo",
  "total_views":1,
  "unique_users":1,
  "top_paths":[{"path":"/","views":1}]
}
```


📈 Scalability Notes
Ingestion is non-blocking due to Redis queue
Worker can scale horizontally
Reporting uses indexed SQL queries
System supports high event volume

