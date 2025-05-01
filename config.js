require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  HUGGINGFACE_API_KEY: process.env.HUGGINGFACE_API_KEY,
  AI_SERVICE_KEY: process.env.API_KEY || 'fs913x_uykFcLWSMeAjNTxS6DgikJfUW7LCt2whNHGQ', 
  DB_CONFIG: {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME,
    DB_PORT: process.env.DB_PORT || 5432,
    DB_SSL: process.env.DB_SSL === 'true' ? { 
      rejectUnauthorized: false 
    } : false
  }
};