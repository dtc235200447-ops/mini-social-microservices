const { Sequelize } = require('sequelize');
require('dotenv').config();

const requiredEnv = ['DB_NAME', 'DB_USER', 'DB_PASS', 'DB_HOST'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required database environment variable(s): ${missingEnv.join(', ')}`);
}

const sslEnabled = process.env.DB_SSL === 'true';
const sslRejectUnauthorized = process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false';
const dialectOptions = sslEnabled
  ? {
      ssl: {
        require: true,
        rejectUnauthorized: sslRejectUnauthorized,
      },
    }
  : {};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    dialect: 'postgres',
    logging: false,
    dialectOptions,
  }
);

module.exports = sequelize;
