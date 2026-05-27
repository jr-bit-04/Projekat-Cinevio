const { Pool } = require("pg");

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl:
          process.env.DB_SSL === "false"
            ? false
            : { rejectUnauthorized: false },
      }
    : {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }
);

pool.connect()
  .then((client) => {
    console.log("PostgreSQL connected");
    client.release();

    return pool.query(`
      ALTER TABLE reviews
      ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true
    `);
  })
  .then(() => {
    console.log("Review visibility column ready");
  })
  .catch((err) => {
  console.error("Failed to connect to DB:", err);
  process.exit(1);  
});

module.exports = pool;
