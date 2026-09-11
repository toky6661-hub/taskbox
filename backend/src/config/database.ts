const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),

  // 👇 修改这里
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false // 本地开发：允许自签名证书
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- 👈 注意这里：原代码拼写有误 (updatad_at)，已修正
        INDEX idx_users_email (email)
      )
    `);
    console.log('✅ users 表已就绪');
  } catch (err) {
    console.error('❌ 建表失败:', err);
  }
}

initDatabase();

module.exports = pool;