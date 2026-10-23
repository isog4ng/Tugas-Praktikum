require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'todouser',
  password: process.env.DB_PASSWORD || 'todopassword',
  database: process.env.DB_NAME || 'tododb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database table
async function initDB() {
  try {
    const conn = await pool.getConnection();
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    conn.release();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization error:', err);
    // Retry after 3 seconds if DB not ready
    setTimeout(initDB, 3000);
  }
}

// Routes
// GET all todos
app.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM todos ORDER BY created_at DESC');
    res.render('index', { todos: rows, error: null });
  } catch (err) {
    console.error(err);
    res.render('index', { todos: [], error: 'Gagal mengambil data dari database.' });
  }
});

// POST create todo
app.post('/todos', async (req, res) => {
  const { title, description } = req.body;
  if (!title || title.trim() === '') {
    return res.redirect('/');
  }
  try {
    await pool.execute(
      'INSERT INTO todos (title, description) VALUES (?, ?)',
      [title.trim(), description ? description.trim() : '']
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// POST toggle complete
app.post('/todos/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute(
      'UPDATE todos SET completed = NOT completed WHERE id = ?',
      [id]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// POST delete todo
app.post('/todos/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM todos WHERE id = ?', [id]);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.redirect('/');
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  await initDB();
});
