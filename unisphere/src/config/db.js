/**
 * Database configuration for UniSphere
 * 
 * This file contains the configuration for connecting to the MySQL database.
 * It exports functions for executing queries and managing connections.
 */

import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'unisphere',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Execute a SQL query with optional parameters
 * @param {string} sql - The SQL query to execute
 * @param {Array} params - The parameters for the query
 * @returns {Promise} - The query result
 */
export const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a single row from a query result
 * @param {string} sql - The SQL query to execute
 * @param {Array} params - The parameters for the query
 * @returns {Promise} - A single row or null
 */
export const getOne = async (sql, params) => {
  const results = await query(sql, params);
  return results.length > 0 ? results[0] : null;
};

/**
 * Insert a row into a table
 * @param {string} table - The table name
 * @param {Object} data - The data to insert
 * @returns {Promise} - The insert result
 */
export const insert = async (table, data) => {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  
  try {
    const result = await query(sql, values);
    return result;
  } catch (error) {
    console.error('Insert error:', error);
    throw error;
  }
};

/**
 * Update rows in a table
 * @param {string} table - The table name
 * @param {Object} data - The data to update
 * @param {Object} condition - The where condition
 * @returns {Promise} - The update result
 */
export const update = async (table, data, condition) => {
  const dataKeys = Object.keys(data);
  const dataValues = Object.values(data);
  
  const conditionKeys = Object.keys(condition);
  const conditionValues = Object.values(condition);
  
  const setClause = dataKeys.map(key => `${key} = ?`).join(', ');
  const whereClause = conditionKeys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
  
  try {
    const result = await query(sql, [...dataValues, ...conditionValues]);
    return result;
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
};

/**
 * Delete rows from a table
 * @param {string} table - The table name
 * @param {Object} condition - The where condition
 * @returns {Promise} - The delete result
 */
export const remove = async (table, condition) => {
  const keys = Object.keys(condition);
  const values = Object.values(condition);
  
  const whereClause = keys.map(key => `${key} = ?`).join(' AND ');
  
  const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
  
  try {
    const result = await query(sql, values);
    return result;
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

export default {
  query,
  getOne,
  insert,
  update,
  remove
}; 