# 📘 Analytics Backend — Event Ingestion, Queue Processing & Reporting

A high-performance analytics backend designed to handle large volumes of incoming events through asynchronous processing using Redis queues, persistent storage with PostgreSQL, and aggregated reporting through a dedicated API.

---

## 🧩 **1. Architecture Overview**

**Flow:**  
Client → Ingestion API → Redis Queue → Worker → PostgreSQL → Reporting API

### **Why This Architecture?**
- **Fast ingestion:** Events return immediately (no DB wait).  
- **Decoupled processing:** Redis queue absorbs traffic spikes.  
- **Scalable:** Add more workers to handle load.  
- **Reliable:** BullMQ handles retries & failures.  
- **Efficient:** SQL aggregation on indexed fields.  

---

## 🧠 **2. Architecture Decision (Asynchronous Processing)**

### **Why Asynchronous Processing?**
Directly writing to the database during ingestion would:

- Slow down responses  
- Create bottlenecks  
- Fail during high load  

### **Using Redis + BullMQ**
- Ingestion becomes instant  
- Worker handles DB writes separately  
- Retries and failures are auto-handled  

---

## 🗄️ **3. Database Schema**

### **SQL Schema**
```sql
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  site_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Indexes**
```sql
CREATE INDEX idx_events_site_date ON events (site_id, (DATE(timestamp)));
CREATE INDEX idx_events_path ON events (site_id, path);
```

### **Diagram**
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

---

## ⚙️ **4. Setup Instructions**

### **Step 1 — Start Redis (WSL)**  
```bash
sudo service redis-server start
redis-cli ping
```

### **Step 2 — Create PostgreSQL Database**  
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_site_date ON events (site_id, (DATE(timestamp)));
```

### **Step 3 — Install Node Dependencies**  
In each folder:
```bash
npm install
```

### **Step 4 — Add Environment Variables**

#### ingestion/.env  
```
PORT=3000
```

#### processor/.env  
```
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/analytics
```

#### reporting/.env  
```
PORT=4000
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/analytics
```

### **Step 5 — Start All Services**

#### Ingestion API  
```bash
cd ingestion
npm start
```

#### Processor Worker  
```bash
cd processor
npm start
```

#### Reporting API  
```bash
cd reporting
npm start
```

---

## 🔌 **5. API Usage**

### **POST /event**
```bash
curl -X POST http://localhost:3000/event   -H "Content-Type: application/json"   -d '{"site_id":"demo","event_type":"view","path":"/","user_id":"u1","timestamp":"2025-11-14T10:00:00Z"}'
```

Expected response:
```json
{"status":"ok"}
```

### **GET /stats**
```bash
curl "http://localhost:4000/stats?site_id=demo"
```

Example output:
```json
{
  "site_id": "demo",
  "date": null,
  "total_views": 1,
  "unique_users": 1,
  "top_paths": [
    {"path": "/", "views": 1}
  ]
}
```

---

## 🧩 **6. How It Works**

1. Ingestion API receives event  
2. Validates & pushes to Redis queue  
3. Worker reads jobs from queue  
4. Saves events to PostgreSQL  
5. Reporting API aggregates data  

---

## ✔️ **Summary**

This project demonstrates:

- High-speed ingestion  
- Scalable async processing  
- Queue-based architecture  
- Reliable event storage  
- Fast aggregated reporting  
