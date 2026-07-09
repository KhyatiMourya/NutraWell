import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const Explore = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State for search

  useEffect(() => {
    fetch("http://localhost:3000/api/recipes")
      .then((res) => res.json())
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading recipes:", err);
        setLoading(false);
      });
  }, []);

  // Filter recipes based on the search term
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <h2>Loading delicious recipes...</h2>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-4 md:mb-0">
          Discover Recipes
        </h1>

        {/* Search Bar Input */}
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 p-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Filtered and sliced recipes */}
        {filteredRecipes.slice(0, 20).map((recipe) => (
          <Link to={`/recipes/${recipe.recipe_id}`} key={recipe.recipe_id}>
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-4 transition-transform hover:scale-105 hover:border-green-400 text-white h-full">
              <img
                src={recipe.image_url}
                alt={recipe.title}
                className="rounded-xl mb-4 w-full h-40 object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x200?text=No+Image";
                }}
              />
              <h3 className="text-lg font-semibold">{recipe.title}</h3>
              <p className="text-sm opacity-80 mt-2">
                {recipe.instructions
                  ? recipe.instructions.substring(0, 60)
                  : "No instructions available"}
                ...
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Explore;
