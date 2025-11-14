require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.get('/stats', async (req, res) => {
  const { site_id, date } = req.query;
  if (!site_id) return res.status(400).json({ error: 'site_id required' });

  const dateFilter = date ? `AND DATE(timestamp) = $2` : '';
  try {
    const values = date ? [site_id, date] : [site_id];

    const totalQ = `SELECT COUNT(*)::int as total_views FROM events WHERE site_id = $1 ${dateFilter}`;
    const uniqueQ = `SELECT COUNT(DISTINCT user_id)::int as unique_users FROM events WHERE site_id = $1 ${dateFilter}`;
    const topPathsQ = `
      SELECT path, COUNT(*)::int as views
      FROM events WHERE site_id = $1 ${dateFilter}
      GROUP BY path ORDER BY views DESC LIMIT 10
    `;

    const [totalRes, uniqueRes, pathsRes] = await Promise.all([
      pool.query(totalQ, values),
      pool.query(uniqueQ, values),
      pool.query(topPathsQ, values)
    ]);

    res.json({
      site_id,
      date: date || null,
      total_views: totalRes.rows[0].total_views,
      unique_users: uniqueRes.rows[0].unique_users,
      top_paths: pathsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server error' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log('Reporting API listening on', port));
