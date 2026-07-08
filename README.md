# NutraWell Health & Wellness Platform

NutraWell is a premium, secure, and production-ready AI-driven nutrition and recipe exploration application. This platform integrates local SQLite databases, Azure SQL Databases (via connection pooling), and the external Spoonacular Recipe & Nutrition API.

---

## 1. Setup & Configuration

### Pasting the Spoonacular API Key
1. Create a `.env` file inside the `backend/` directory if it does not already exist.
2. Open `backend/.env` and paste the following parameters:
   ```env
   SPOONACULAR_API_KEY=YOUR_SPOONACULAR_API_KEY_HERE
   SPOONACULAR_BASE_URL=https://api.spoonacular.com
   ```
3. To obtain a free API key, register an account at [Spoonacular API Console](https://spoonacular.com/food-api/console/register).

---

## 2. How to Run Locally

### Step 1: Install Dependencies
Run the unified setup script from the root workspace directory to install all package modules:
```bash
npm run setup
```

### Step 2: Start the Servers
Launch both the Node/Express backend and the Vite frontend simultaneously:
```bash
npm run dev
```
* **Client App**: http://localhost:5173
* **API Server Check**: http://localhost:5001
* **Swagger API Documentation**: http://localhost:5001/api-docs

---

## 3. How to Deploy to Azure

NutraWell is designed with a production-ready cloud architecture. Follow these instructions to deploy the backend and frontend to Azure:

### Deploying the Backend to Azure App Service
1. Create an **App Service** (Linux Node.js environment).
2. Configure your deployment source (e.g. GitHub Actions or local Git repository push).
3. In the App Service configuration settings, add the following environment variables (App Settings):
   - `SPOONACULAR_API_KEY`: Paste your Spoonacular key here.
   - `SPOONACULAR_BASE_URL`: `https://api.spoonacular.com`
   - `PORT`: `8080` (or leave default)

### Database Deployment
If using **Azure SQL Database**, supply your connection string under the environment variable `AZURE_SQL_CONNECTION_STRING`. The application will automatically detect this connection, run migrations, and skip local SQLite fallbacks.

---

## 4. Migrating to Azure Key Vault (Production Best Practice)

To enhance security in production, you can store your Spoonacular API key inside **Azure Key Vault** without changing any code:

1. **Create an Azure Key Vault** instance in your Resource Group.
2. **Add a Secret** named `SPOONACULAR-API-KEY` containing your Spoonacular credentials.
3. **Configure Managed Identity**:
   - Turn on **System Assigned Managed Identity** for your Azure App Service.
   - Go to your Key Vault **Access Policies** (or Azure RBAC) and grant your App Service's Managed Identity permission to `Get` and `List` secrets.
4. **Link App Service App Settings**:
   - Navigate to your App Service Configuration settings.
   - Edit the `SPOONACULAR_API_KEY` setting value to map directly to the Key Vault secret using this syntax:
     ```text
     @Microsoft.KeyVault(SecretUri=https://<your-keyvault-name>.vault.azure.net/secrets/SPOONACULAR-API-KEY/)
     ```
   - Azure App Service resolves this link automatically on startup, loading it into `process.env.SPOONACULAR_API_KEY` transparently.
