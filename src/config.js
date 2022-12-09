const PORT = process.env.PORT || 8080;

const DB_HOST = process.env.DB_HOST || "127.0.0.1";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASSWORD = process.env.DB_PASSWORD || "adaneitor1998";
const DB_NAME = process.env.DB_NAME || "smart-brain";
const DB_PORT = process.env.DB_PORT || "5432";

module.exports = {
  PORT,
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
};
