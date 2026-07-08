import sqlite3 from 'sqlite3';
import sql from 'mssql';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { seedRecipes, seedAdminUser } from '../utils/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isAzureSql = !!process.env.AZURE_SQL_CONNECTION_STRING;

let sqliteDbInstance = null;
let mssqlPoolInstance = null;

// Initialize Database connection
export async function connectDB() {
  if (isAzureSql) {
    console.log('Connecting to Azure SQL Database...');
    try {
      mssqlPoolInstance = await sql.connect(process.env.AZURE_SQL_CONNECTION_STRING);
      console.log('Connected to Azure SQL Database successfully.');
    } catch (err) {
      console.error('Failed to connect to Azure SQL Database, falling back to local SQLite.', err.message);
      initializeSqlite();
    }
  } else {
    initializeSqlite();
  }

  // Run migrations/table creation
  await initializeTables();
  await seedRecipes();
  await seedAdminUser();
}

function initializeSqlite() {
  console.log('Initializing local SQLite Database...');
  const dbPath = path.resolve(__dirname, '../../nutrawell.db');
  sqliteDbInstance = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database', err);
    } else {
      console.log(`SQLite connected: ${dbPath}`);
    }
  });
}

// Database agnostic query function
export async function query(sqlText, params = []) {
  if (mssqlPoolInstance) {
    try {
      // Translate '?' to T-SQL '@p1', '@p2', etc.
      let index = 0;
      const tsqlText = sqlText.replace(/\?/g, () => `@p${++index}`);
      
      const request = mssqlPoolInstance.request();
      for (let i = 0; i < params.length; i++) {
        request.input(`p${i + 1}`, params[i]);
      }
      
      const result = await request.query(tsqlText);
      return result.recordset;
    } catch (err) {
      console.error('Azure SQL query execution error:', err);
      throw err;
    }
  } else if (sqliteDbInstance) {
    return new Promise((resolve, reject) => {
      sqliteDbInstance.all(sqlText, params, (err, rows) => {
        if (err) {
          console.error('SQLite query execution error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  } else {
    throw new Error('Database connection not established.');
  }
}

// Database agnostic execution helper for mutations (INSERT/UPDATE/DELETE)
export async function execute(sqlText, params = []) {
  if (mssqlPoolInstance) {
    try {
      let index = 0;
      const tsqlText = sqlText.replace(/\?/g, () => `@p${++index}`);
      
      const request = mssqlPoolInstance.request();
      for (let i = 0; i < params.length; i++) {
        request.input(`p${i + 1}`, params[i]);
      }
      
      const result = await request.query(tsqlText);
      // Return metadata matching sqlite execution where possible
      return {
        rowsAffected: result.rowsAffected[0],
        lastInsertId: result.recordset && result.recordset[0] ? Object.values(result.recordset[0])[0] : null
      };
    } catch (err) {
      console.error('Azure SQL execute error:', err);
      throw err;
    }
  } else if (sqliteDbInstance) {
    return new Promise((resolve, reject) => {
      sqliteDbInstance.run(sqlText, params, function (err) {
        if (err) {
          console.error('SQLite execute error:', err);
          reject(err);
        } else {
          resolve({
            rowsAffected: this.changes,
            lastInsertId: this.lastID
          });
        }
      });
    });
  } else {
    throw new Error('Database connection not established.');
  }
}

// Table Initialization Script
async function initializeTables() {
  const isSqlServer = !!mssqlPoolInstance;
  
  // Define queries for table creation
  const usersTable = isSqlServer 
    ? `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
       CREATE TABLE users (
         id INT IDENTITY(1,1) PRIMARY KEY,
         name NVARCHAR(100) NOT NULL,
         email NVARCHAR(100) UNIQUE NOT NULL,
         password_hash NVARCHAR(255) NOT NULL,
         age INT,
         gender NVARCHAR(20),
         weight FLOAT,
         height FLOAT,
         activity_level NVARCHAR(50),
         goal NVARCHAR(50),
         daily_calorie_target INT DEFAULT 2000,
         diet_preference NVARCHAR(100),
         food_allergies NVARCHAR(250),
         is_admin BIT DEFAULT 0,
         created_at DATETIME DEFAULT GETDATE()
       )`
    : `CREATE TABLE IF NOT EXISTS users (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         name TEXT NOT NULL,
         email TEXT UNIQUE NOT NULL,
         password_hash TEXT NOT NULL,
         age INTEGER,
         gender TEXT,
         weight REAL,
         height REAL,
         activity_level TEXT,
         goal TEXT,
         daily_calorie_target INTEGER DEFAULT 2000,
         diet_preference TEXT,
         food_allergies TEXT,
         is_admin INTEGER DEFAULT 0,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
       )`;

  const recipesTable = isSqlServer
    ? `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'recipes')
       CREATE TABLE recipes (
         id INT IDENTITY(1,1) PRIMARY KEY,
         title NVARCHAR(150) NOT NULL,
         description NVARCHAR(MAX),
         ingredients NVARCHAR(MAX) NOT NULL, -- JSON string array
         instructions NVARCHAR(MAX) NOT NULL, -- JSON string array
         image_url NVARCHAR(500),
         prep_time INT DEFAULT 0,
         cook_time INT DEFAULT 0,
         servings INT DEFAULT 1,
         calories INT DEFAULT 0,
         carbs INT DEFAULT 0,
         protein INT DEFAULT 0,
         fat INT DEFAULT 0,
         fiber INT DEFAULT 0,
         sugar INT DEFAULT 0,
         sodium INT DEFAULT 0,
         iron INT DEFAULT 0,
         calcium INT DEFAULT 0,
         vitamin_c INT DEFAULT 0,
         serving_size NVARCHAR(100),
         estimated_cost INT DEFAULT 0,
         healthy_tips NVARCHAR(MAX),
         storage_instructions NVARCHAR(MAX),
         alternative_ingredients NVARCHAR(MAX),
         thumbnail_url NVARCHAR(255),
         alt_text NVARCHAR(255),
         category_image NVARCHAR(50),
         tags NVARCHAR(255),
         is_ai_generated BIT DEFAULT 0,
         created_at DATETIME DEFAULT GETDATE()
       )`
    : `CREATE TABLE IF NOT EXISTS recipes (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         title TEXT NOT NULL,
         description TEXT,
         ingredients TEXT NOT NULL, -- JSON string
         instructions TEXT NOT NULL, -- JSON string
         image_url TEXT,
         prep_time INTEGER DEFAULT 0,
         cook_time INTEGER DEFAULT 0,
         servings INTEGER DEFAULT 1,
         calories INTEGER DEFAULT 0,
         carbs INTEGER DEFAULT 0,
         protein INTEGER DEFAULT 0,
         fat INTEGER DEFAULT 0,
         fiber INTEGER DEFAULT 0,
         sugar INTEGER DEFAULT 0,
         sodium INTEGER DEFAULT 0,
         iron INTEGER DEFAULT 0,
         calcium INTEGER DEFAULT 0,
         vitamin_c INTEGER DEFAULT 0,
         serving_size TEXT,
         estimated_cost INTEGER DEFAULT 0,
         healthy_tips TEXT,
         storage_instructions TEXT,
         alternative_ingredients TEXT,
         thumbnail_url TEXT,
         alt_text TEXT,
         category_image TEXT,
         tags TEXT,
         is_ai_generated INTEGER DEFAULT 0,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP
       )`;

  const mealPlansTable = isSqlServer
    ? `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'meal_plans')
       CREATE TABLE meal_plans (
         id INT IDENTITY(1,1) PRIMARY KEY,
         user_id INT NOT NULL,
         date NVARCHAR(20) NOT NULL,
         meal_type NVARCHAR(50) NOT NULL,
         recipe_id INT,
         custom_meal_name NVARCHAR(150),
         calories INT DEFAULT 0,
         carbs INT DEFAULT 0,
         protein INT DEFAULT 0,
         fat INT DEFAULT 0,
         completed BIT DEFAULT 0,
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`
    : `CREATE TABLE IF NOT EXISTS meal_plans (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         date TEXT NOT NULL,
         meal_type TEXT NOT NULL,
         recipe_id INTEGER,
         custom_meal_name TEXT,
         calories INTEGER DEFAULT 0,
         carbs INTEGER DEFAULT 0,
         protein INTEGER DEFAULT 0,
         fat INTEGER DEFAULT 0,
         completed INTEGER DEFAULT 0,
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`;

  const nutritionLogsTable = isSqlServer
    ? `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'nutrition_logs')
       CREATE TABLE nutrition_logs (
         id INT IDENTITY(1,1) PRIMARY KEY,
         user_id INT NOT NULL,
         date NVARCHAR(20) NOT NULL,
         meal_name NVARCHAR(100) NOT NULL,
         calories INT DEFAULT 0,
         carbs INT DEFAULT 0,
         protein INT DEFAULT 0,
         fat INT DEFAULT 0,
         water_ml INT DEFAULT 0,
         created_at DATETIME DEFAULT GETDATE(),
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`
    : `CREATE TABLE IF NOT EXISTS nutrition_logs (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         date TEXT NOT NULL,
         meal_name TEXT NOT NULL,
         calories INTEGER DEFAULT 0,
         carbs INTEGER DEFAULT 0,
         protein INTEGER DEFAULT 0,
         fat INTEGER DEFAULT 0,
         water_ml INTEGER DEFAULT 0,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`;

  const goalsTable = isSqlServer
    ? `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'goals')
       CREATE TABLE goals (
         id INT IDENTITY(1,1) PRIMARY KEY,
         user_id INT NOT NULL,
         type NVARCHAR(50) NOT NULL, -- e.g. weight, water, calories
         target_value FLOAT NOT NULL,
         current_value FLOAT NOT NULL,
         target_date NVARCHAR(20),
         created_at DATETIME DEFAULT GETDATE(),
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`
    : `CREATE TABLE IF NOT EXISTS goals (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         type TEXT NOT NULL,
         target_value REAL NOT NULL,
         current_value REAL NOT NULL,
         target_date TEXT,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`;

  const weightLogsTable = isSqlServer
    ? `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'weight_logs')
       CREATE TABLE weight_logs (
         id INT IDENTITY(1,1) PRIMARY KEY,
         user_id INT NOT NULL,
         date NVARCHAR(20) NOT NULL,
         weight_kg FLOAT NOT NULL,
         notes NVARCHAR(255),
         created_at DATETIME DEFAULT GETDATE(),
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`
    : `CREATE TABLE IF NOT EXISTS weight_logs (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         date TEXT NOT NULL,
         weight_kg REAL NOT NULL,
         notes TEXT,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`;

  const exerciseLogsTable = isSqlServer
    ? `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'exercise_logs')
       CREATE TABLE exercise_logs (
         id INT IDENTITY(1,1) PRIMARY KEY,
         user_id INT NOT NULL,
         date NVARCHAR(20) NOT NULL,
         activity_name NVARCHAR(150) NOT NULL,
         minutes INT NOT NULL DEFAULT 0,
         calories_burned INT NOT NULL DEFAULT 0,
         created_at DATETIME DEFAULT GETDATE(),
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`
    : `CREATE TABLE IF NOT EXISTS exercise_logs (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         date TEXT NOT NULL,
         activity_name TEXT NOT NULL,
         minutes INTEGER NOT NULL DEFAULT 0,
         calories_burned INTEGER NOT NULL DEFAULT 0,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`;

  const sleepLogsTable = isSqlServer
    ? `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sleep_logs')
       CREATE TABLE sleep_logs (
         id INT IDENTITY(1,1) PRIMARY KEY,
         user_id INT NOT NULL,
         date NVARCHAR(20) NOT NULL,
         hours_slept FLOAT NOT NULL,
         quality NVARCHAR(50),
         created_at DATETIME DEFAULT GETDATE(),
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`
    : `CREATE TABLE IF NOT EXISTS sleep_logs (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_id INTEGER NOT NULL,
         date TEXT NOT NULL,
         hours_slept REAL NOT NULL,
         quality TEXT,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
       )`;

  try {
    if (isSqlServer) {
      await mssqlPoolInstance.request().query(usersTable);
      await mssqlPoolInstance.request().query(recipesTable);
      await mssqlPoolInstance.request().query(mealPlansTable);
      await mssqlPoolInstance.request().query(nutritionLogsTable);
      await mssqlPoolInstance.request().query(goalsTable);
      await mssqlPoolInstance.request().query(weightLogsTable);
      await mssqlPoolInstance.request().query(exerciseLogsTable);
      await mssqlPoolInstance.request().query(sleepLogsTable);
      // Run migrations/alter queries
      try { await mssqlPoolInstance.request().query("ALTER TABLE users ADD diet_preference NVARCHAR(100)"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE users ADD food_allergies NVARCHAR(250)"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE users ADD is_admin BIT DEFAULT 0"); } catch (e) {}
      // Run migrations for recipes table
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD fiber INT DEFAULT 0"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD sugar INT DEFAULT 0"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD sodium INT DEFAULT 0"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD iron INT DEFAULT 0"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD calcium INT DEFAULT 0"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD vitamin_c INT DEFAULT 0"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD serving_size NVARCHAR(100)"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD estimated_cost INT DEFAULT 0"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD healthy_tips NVARCHAR(MAX)"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD storage_instructions NVARCHAR(MAX)"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD alternative_ingredients NVARCHAR(MAX)"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD thumbnail_url NVARCHAR(255)"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD alt_text NVARCHAR(255)"); } catch (e) {}
      try { await mssqlPoolInstance.request().query("ALTER TABLE recipes ADD category_image NVARCHAR(50)"); } catch (e) {}
    } else {
      const runSql = (sqlText) => new Promise((resolve, reject) => {
        sqliteDbInstance.run(sqlText, (err) => (err ? reject(err) : resolve()));
      });
      await runSql(usersTable);
      await runSql(recipesTable);
      await runSql(mealPlansTable);
      await runSql(nutritionLogsTable);
      await runSql(goalsTable);
      await runSql(weightLogsTable);
      await runSql(exerciseLogsTable);
      await runSql(sleepLogsTable);
      // Run migrations/alter queries
      try { await runSql("ALTER TABLE users ADD COLUMN diet_preference TEXT"); } catch (e) {}
      try { await runSql("ALTER TABLE users ADD COLUMN food_allergies TEXT"); } catch (e) {}
      try { await runSql("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0"); } catch (e) {}
      // Run migrations for recipes table
      try { await runSql("ALTER TABLE recipes ADD COLUMN fiber INTEGER DEFAULT 0"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN sugar INTEGER DEFAULT 0"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN sodium INTEGER DEFAULT 0"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN iron INTEGER DEFAULT 0"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN calcium INTEGER DEFAULT 0"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN vitamin_c INTEGER DEFAULT 0"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN serving_size TEXT"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN estimated_cost INTEGER DEFAULT 0"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN healthy_tips TEXT"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN storage_instructions TEXT"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN alternative_ingredients TEXT"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN thumbnail_url TEXT"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN alt_text TEXT"); } catch (e) {}
      try { await runSql("ALTER TABLE recipes ADD COLUMN category_image TEXT"); } catch (e) {}
    }
    console.log('Database tables verified/created successfully.');
  } catch (err) {
    console.error('Error creating database tables:', err);
  }
}
