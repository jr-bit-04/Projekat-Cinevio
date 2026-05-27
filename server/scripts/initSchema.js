const fs = require("fs");
const path = require("path");
require("dotenv").config();

const db = require("../config/db");

async function initSchema() {
  const schemaPath = path.join(__dirname, "..", "db", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  await db.query(schema);
  console.log("Database schema initialized");
  process.exit(0);
}

initSchema().catch((error) => {
  console.error("Failed to initialize database schema:", error);
  process.exit(1);
});
