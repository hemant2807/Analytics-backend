📊 Analytics Backend — Event Ingestion, Queue Processing & Reporting
This project implements a high-performance analytics backend capable of handling large volumes of incoming web events using asynchronous processing, a Redis-backed queue, and Postgres storage, with a clean reporting API for aggregated statistics.
This README explains the architecture, the queue mechanism, database schema, setup steps, and how to use the APIs.

🧠 1. Architecture Decision
🎯 Goal
Handle extremely high volumes of analytics events without slowing down ingestion.
Your ingestion endpoint must return instantly even under heavy load.
🏗️ Chosen Architecture
Client → Ingestion API → Redis Queue → Worker → Postgres → Reporting API

🟦 Why Asynchronous Processing?
Directly writing each incoming event into a database causes:
Connection bottlenecks
Slow response times
API timeouts during traffic spikes
Using a queue solves this by decoupling ingestion from processing.
🟥 Why Redis + BullMQ?
Redis is in-memory → very fast
BullMQ handles retries, backoff, job persistence
Allows horizontal scaling: multiple workers can process jobs in parallel
🟩 Benefits
Ingestion is non-blocking
System absorbs traffic spikes safely
Workers can be scaled independently
Durable write processing with retries
Industry-standard architecture (Segment, RudderStack, Mixpanel use similar)

🗄️ 2. Database Schema
Events are stored in a single table optimized for analytics queries.
🟩 SQL Schema
```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

🧱 Indexes
```sql
CREATE INDEX idx_events_site_date ON events (site_id, (DATE(timestamp)));
CREATE INDEX idx_events_path ON events (site_id, path);
```

📊 Simple ER Diagram
```
+-------------------------------+
|            events             |
+-------------------------------+
| id (PK)                       |
| site_id                       |
| event_type                    |
| path                          |
| user_id                       |
| timestamp                     |
| created_at                    |
+-------------------------------+
```


🛠️ 3. Setup Instructions (Step-by-Step)
✅ Prerequisites
Node.js (v18+)
Postgres installed locally
Redis running inside WSL (Ubuntu)
VS Code or any terminal

🔧 3.1 Clone or Create the Repository
```
analytics-backend/
├── ingestion/
├── processor/
├── reporting/
└── shared/   (empty)
```


🗄️ 3.2 Setup Postgres
Open psql and run:
```sql
CREATE DATABASE analytics;

\c analytics;

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
```


🔌 3.3 Start Redis (inside WSL)
```
sudo service redis-server start
redis-cli ping

Expected:
PONG
```


📦 3.4 Install Dependencies
Ingestion service
```
cd ingestion
npm install
```

Processor service
```
cd processor
npm install
```

Reporting service
```
cd reporting
npm install
```


⚙️ 3.5 Environment Variables
```
ingestion/.env
PORT=3000

processor/.env
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/analytics

reporting/.env
PORT=4000
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/analytics
```


🚀 3.6 Start All Services (3 Terminals)
Terminal 1 — ingestion
```
cd ingestion
npm start
```

Terminal 2 — processor
```
cd processor
npm start
```

Terminal 3 — reporting
```
cd reporting
npm start
```


🔌 4. API Usage (curl Examples)
🟦 POST /event
Send a tracking event to ingestion:
```bash
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d "{\"site_id\":\"demo\",\"event_type\":\"view\",\"path\":\"/\",\"user_id\":\"u1\",\"timestamp\":\"2025-11-14T10:00:00Z\"}"
```

Expected output:
```json
{"status":"ok"}
```

The worker terminal should show:
```
job completed 1
```


🟩 GET /stats
Fetch analytics summary:
```bash
curl "http://localhost:4000/stats?site_id=demo"
```

Expected output:
```json
{
  "site_id":"demo",
  "date":null,
  "total_views":1,
  "unique_users":1,
  "top_paths":[
    {"path":"/","views":1}
  ]
}
```


🧩 5. How it Works (Short Summary)
1. Client sends /event → ingestion validates & enqueues job
2. Redis queue stores jobs
3. Worker consumes jobs → inserts into Postgres
4. Reporting API aggregates SQL data and returns stats

📊 Analytics Backend — Event Ingestion, Queue Processing & Reporting
This project implements a high-performance analytics backend capable of handling large volumes of incoming web events using asynchronous processing, a Redis-backed queue, and Postgres storage, with a clean reporting API for aggregated statistics.
This README explains the architecture, the queue mechanism, database schema, setup steps, and how to use the APIs.

🧠 1. Architecture Decision
🎯 Goal
Handle extremely high volumes of analytics events without slowing down ingestion.
Your ingestion endpoint must return instantly even under heavy load.
🏗️ Chosen Architecture
Client → Ingestion API → Redis Queue → Worker → Postgres → Reporting API

🟦 Why Asynchronous Processing?
Directly writing each incoming event into a database causes:
Connection bottlenecks
Slow response times
API timeouts during traffic spikes
Using a queue solves this by decoupling ingestion from processing.
🟥 Why Redis + BullMQ?
Redis is in-memory → very fast
BullMQ handles retries, backoff, job persistence
Allows horizontal scaling: multiple workers can process jobs in parallel
🟩 Benefits
Ingestion is non-blocking
System absorbs traffic spikes safely
Workers can be scaled independently
Durable write processing with retries
Industry-standard architecture (Segment, RudderStack, Mixpanel use similar)

🗄️ 2. Database Schema
Events are stored in a single table optimized for analytics queries.
🟩 SQL Schema
```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

🧱 Indexes
```sql
CREATE INDEX idx_events_site_date ON events (site_id, (DATE(timestamp)));
CREATE INDEX idx_events_path ON events (site_id, path);
```

📊 Simple ER Diagram
```
+-------------------------------+
|            events             |
+-------------------------------+
| id (PK)                       |
| site_id                       |
| event_type                    |
| path                          |
| user_id                       |
| timestamp                     |
| created_at                    |
+-------------------------------+
```


🛠️ 3. Setup Instructions (Step-by-Step)
✅ Prerequisites
Node.js (v18+)
Postgres installed locally
Redis running inside WSL (Ubuntu)
VS Code or any terminal

🔧 3.1 Clone or Create the Repository
```
analytics-backend/
├── ingestion/
├── processor/
├── reporting/
└── shared/   (empty)
```


🗄️ 3.2 Setup Postgres
Open psql and run:
```sql
CREATE DATABASE analytics;

\c analytics;

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
```


🔌 3.3 Start Redis (inside WSL)
```
sudo service redis-server start
redis-cli ping

Expected:
PONG
```


📦 3.4 Install Dependencies
Ingestion service
```
cd ingestion
npm install
```

Processor service
```
cd processor
npm install
```

Reporting service
```
cd reporting
npm install
```


⚙️ 3.5 Environment Variables
```
ingestion/.env
PORT=3000

processor/.env
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/analytics

reporting/.env
PORT=4000
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/analytics
```


🚀 3.6 Start All Services (3 Terminals)
Terminal 1 — ingestion
```
cd ingestion
npm start
```

Terminal 2 — processor
```
cd processor
npm start
```

Terminal 3 — reporting
```
cd reporting
npm start
```


🔌 4. API Usage (curl Examples)
🟦 POST /event
Send a tracking event to ingestion:
```bash
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d "{\"site_id\":\"demo\",\"event_type\":\"view\",\"path\":\"/\",\"user_id\":\"u1\",\"timestamp\":\"2025-11-14T10:00:00Z\"}"
```

Expected output:
```json
{"status":"ok"}
```

The worker terminal should show:
```
job completed 1
```


🟩 GET /stats
Fetch analytics summary:
```bash
curl "http://localhost:4000/stats?site_id=demo"
```

Expected output:
```json
{
  "site_id":"demo",
  "date":null,
  "total_views":1,
  "unique_users":1,
  "top_paths":[
    {"path":"/","views":1}
  ]
}
```


🧩 5. How it Works (Short Summary)
1. Client sends /event → ingestion validates & enqueues job
2. Redis queue stores jobs
3. Worker consumes jobs → inserts into Postgres
4. Reporting API aggregates SQL data and returns stats


📊 Analytics Backend — Event Ingestion, Queue Processing & Reporting
This project implements a high-performance analytics backend capable of handling large volumes of incoming web events using asynchronous processing, a Redis-backed queue, and Postgres storage, with a clean reporting API for aggregated statistics.
This README explains the architecture, the queue mechanism, database schema, setup steps, and how to use the APIs.

🧠 1. Architecture Decision
🎯 Goal
Handle extremely high volumes of analytics events without slowing down ingestion.
Your ingestion endpoint must return instantly even under heavy load.
🏗️ Chosen Architecture
Client → Ingestion API → Redis Queue → Worker → Postgres → Reporting API

🟦 Why Asynchronous Processing?
Directly writing each incoming event into a database causes:
Connection bottlenecks
Slow response times
API timeouts during traffic spikes
Using a queue solves this by decoupling ingestion from processing.
🟥 Why Redis + BullMQ?
Redis is in-memory → very fast
BullMQ handles retries, backoff, job persistence
Allows horizontal scaling: multiple workers can process jobs in parallel
🟩 Benefits
Ingestion is non-blocking
System absorbs traffic spikes safely
Workers can be scaled independently
Durable write processing with retries
Industry-standard architecture (Segment, RudderStack, Mixpanel use similar)

🗄️ 2. Database Schema
Events are stored in a single table optimized for analytics queries.
🟩 SQL Schema
```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

🧱 Indexes
```sql
CREATE INDEX idx_events_site_date ON events (site_id, (DATE(timestamp)));
CREATE INDEX idx_events_path ON events (site_id, path);
```

📊 Simple ER Diagram
```
+-------------------------------+
|            events             |
+-------------------------------+
| id (PK)                       |
| site_id                       |
| event_type                    |
| path                          |
| user_id                       |
| timestamp                     |
| created_at                    |
+-------------------------------+
```


🛠️ 3. Setup Instructions (Step-by-Step)
✅ Prerequisites
Node.js (v18+)
Postgres installed locally
Redis running inside WSL (Ubuntu)
VS Code or any terminal

🔧 3.1 Clone or Create the Repository
```
analytics-backend/
├── ingestion/
├── processor/
├── reporting/
└── shared/   (empty)
```


🗄️ 3.2 Setup Postgres
Open psql and run:
```sql
CREATE DATABASE analytics;

\c analytics;

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
```


🔌 3.3 Start Redis (inside WSL)
```
sudo service redis-server start
redis-cli ping

Expected:
PONG
```


📦 3.4 Install Dependencies
Ingestion service
```
cd ingestion
npm install
```

Processor service
```
cd processor
npm install
```

Reporting service
```
cd reporting
npm install
```


⚙️ 3.5 Environment Variables
```
ingestion/.env
PORT=3000

processor/.env
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/analytics

reporting/.env
PORT=4000
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/analytics
```


🚀 3.6 Start All Services (3 Terminals)
Terminal 1 — ingestion
```
cd ingestion
npm start
```

Terminal 2 — processor
```
cd processor
npm start
```

Terminal 3 — reporting
```
cd reporting
npm start
```


🔌 4. API Usage (curl Examples)
🟦 POST /event
Send a tracking event to ingestion:
```bash
curl -X POST http://localhost:3000/event \
  -H "Content-Type: application/json" \
  -d "{\"site_id\":\"demo\",\"event_type\":\"view\",\"path\":\"/\",\"user_id\":\"u1\",\"timestamp\":\"2025-11-14T10:00:00Z\"}"
```

Expected output:
```json
{"status":"ok"}
```

The worker terminal should show:
```
job completed 1
```


🟩 GET /stats
Fetch analytics summary:
```bash
curl "http://localhost:4000/stats?site_id=demo"
```

Expected output:
```json
{
  "site_id":"demo",
  "date":null,
  "total_views":1,
  "unique_users":1,
  "top_paths":[
    {"path":"/","views":1}
  ]
}
```


🧩 5. How it Works (Short Summary)
1. Client sends /event → ingestion validates & enqueues job
2. Redis queue stores jobs
3. Worker consumes jobs → inserts into Postgres
4. Reporting API aggregates SQL data and returns stats


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

