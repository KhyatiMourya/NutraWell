import express from 'express';
import sql from 'mssql';
import cors from 'cors';

const app = express();
const port = 3000;

// 1. FIXED CORS
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

// 2. ESSENTIAL: Parse incoming JSON requests
app.use(express.json());

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

// Route: Fetch Recipes
app.get('/api/recipes', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM Recipes');
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).json({ error: 'Failed to fetch recipes' });
    }
});

// Route: Login
app.post('/api/auth/login', async (req, res) => {
    console.log("Login attempt received:", req.body);
    res.json({ message: "Login logic goes here" });
});

// Route: Register - ADDED THIS
app.post('/api/register', async (req, res) => {
    try {
        // This will log the registration data to your terminal
        console.log("Registration data received:", req.body);
        
        // Respond to the frontend
        res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        console.error('Registration error', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.listen(port, () => {
    console.log(`NutraWell API running at http://localhost:${port}`);
});