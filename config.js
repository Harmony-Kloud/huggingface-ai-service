require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  AI_SERVICE_KEY: process.env.API_KEY || 'fs913x_uykFcLWSMeAjNTxS6DgikJfUW7LCt2whNHGQ', 
  DB_CONFIG: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: process.env.DB_SSL === 'true' ? { 
      rejectUnauthorized: false 
    } : false
  }
};