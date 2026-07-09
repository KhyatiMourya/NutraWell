import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

// Your Azure SQL configuration
const config = {
    user: 'Nutrawelladmin', 
    password: 'Khyati@aug1',
    server: 'nutrawell-server-xyz.database.windows.net', 
    database: 'free-sql-db-5244279',
    options: {
        encrypt: true, 
        trustServerCertificate: false
    }
};

app.get('/api/recipes', async (req, res) => {
    try {
        // Connect to the database
        let pool = await sql.connect(config);
        
        // Query the data
        let result = await pool.request().query('SELECT * FROM Recipes');
        
        // Return the JSON data
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

app.listen(port, () => {
    console.log(`NutraWell API running at http://localhost:${port}`);
});