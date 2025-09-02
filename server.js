require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  } else {
    console.log('✅ Connected to MySQL Database');
  }
});

// Create table if not exists
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS wallet_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL,
    wallet_type VARCHAR(50),
    asset VARCHAR(50),
    network VARCHAR(50),
    total_balance DECIMAL(18, 8),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`;

db.query(createTableQuery, err => {
  if (err) console.error('Error creating table:', err);
  else console.log('✅ Table ready');
});

// Routes
app.get('/', (req, res) => {
  res.send('Backend API is running 🚀');
});

// Add user submission (POST)
app.post('/api/submit', (req, res) => {
  const { wallet_address, wallet_type, asset, network, total_balance } = req.body;

  if (!wallet_address || !asset || !network || total_balance === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = `
    INSERT INTO wallet_data (wallet_address, wallet_type, asset, network, total_balance)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(query, [wallet_address, wallet_type, asset, network, total_balance], (err, result) => {
    if (err) {
      console.error('Insert Error:', err);
      return res.status(500).json({ error: 'Failed to save data' });
    }
    res.json({ message: 'Data saved successfully', id: result.insertId });
  });
});

// Get all submissions for Admin (GET)
app.get('/api/data', (req, res) => {
  db.query('SELECT * FROM wallet_data ORDER BY timestamp DESC', (err, results) => {
    if (err) {
      console.error('Fetch Error:', err);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
    res.json(results);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
