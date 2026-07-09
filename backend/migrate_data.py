import pandas as pd
import kagglehub
from sqlalchemy import create_engine, text
import urllib
import os

# 1. Database Connection
server = "nutrawell-server-xyz.database.windows.net"
database = "free-sql-db-5244279"
username = "Nutrawelladmin"
password = "Khyati@aug1"

params = urllib.parse.quote_plus(
    f"DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}"
)
engine = create_engine(f"mssql+pyodbc:///?odbc_connect={params}")

# 2. Load Dataset
print("Downloading dataset...")
path = kagglehub.dataset_download("kashyap077/indian-recipes-ingredients-nutrition-and-cooking")
file_path = os.path.join(path, "Indian_Food_Ingredients_Nutrition_CookingMethods.csv")
df = pd.read_csv(file_path)

# 3. Migration
try:
    with engine.connect() as conn:
        # Get or create admin user (assuming user_id 1 exists from your test)
        user = conn.execute(text("SELECT TOP 1 user_id FROM Users")).fetchone()
        user_id = user[0] if user else 1

        print(f"Starting migration of {len(df)} records...")

        for index, row in df.iterrows():
            # Correctly mapping CSV columns to database
            title = str(row["final_food_name"]).replace("'", "''")
            instructions = str(row["TranslatedInstructions"]).replace("'", "''")

            # Insert Recipe
            conn.execute(
                text(
                    f"INSERT INTO Recipes (user_id, title, instructions) VALUES ({user_id}, '{title}', '{instructions}')"
                )
            )
            # Retrieve the ID of the recipe just inserted
            recipe_id = conn.execute(text("SELECT SCOPE_IDENTITY()")).scalar()

            # Insert Nutrition using exact CSV headers
            conn.execute(
                text(
                    f"INSERT INTO NutritionalData (recipe_id, calories, protein_g, carbs_g, fat_g) "
                    f"VALUES ({recipe_id}, :cal, :prot, :carb, :fat)"
                ),
                {
                    "cal": row.get("Calories (kcal)", 0),
                    "prot": row.get("Protein (g)", 0),
                    "carb": row.get("Carbohydrates (g)", 0),
                    "fat": row.get("Fats (g)", 0)
                }
            )

        conn.commit()
        print("Migration complete! Data successfully loaded.")

except Exception as e:
    print(f"Migration error: {e}")