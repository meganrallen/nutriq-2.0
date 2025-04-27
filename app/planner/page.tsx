'use client';

import { useState } from 'react';
import { useMealPlanStore, DayOfWeek, MealType } from '../lib/store';
import { searchRecipes, Recipe } from '../lib/spoonacular';
import RecipeCard from '../components/RecipeCard';

const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS: MealType[] = ['breakfast', 'lunch', 'dinner'];

export default function MealPlanner() {
  const { mealPlan, setMeal, clearMealPlan } = useMealPlanStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; meal: MealType } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await searchRecipes(searchQuery);
      setSearchResults(response.results);
    } catch (error) {
      console.error('Error searching recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    if (selectedSlot) {
      setMeal(selectedSlot.day, selectedSlot.meal, recipe);
      setSelectedSlot(null);
      setSearchResults([]);
      setSearchQuery('');
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Meal Planner</h1>
          <button
            onClick={clearMealPlan}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Clear Plan
          </button>
        </div>

        <div className="grid grid-cols-7 gap-4 mb-8">
          {DAYS.map((day) => (
            <div key={day} className="text-center font-semibold capitalize">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {DAYS.map((day) => (
            <div key={day} className="space-y-4">
              {MEALS.map((meal) => (
                <div
                  key={`${day}-${meal}`}
                  className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 ${
                    selectedSlot?.day === day && selectedSlot?.meal === meal
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedSlot({ day, meal })}
                >
                  <h3 className="font-semibold capitalize mb-2">{meal}</h3>
                  {mealPlan[day][meal] ? (
                    <div className="text-sm">
                      <p className="font-medium">{mealPlan[day][meal]?.title}</p>
                      <p className="text-gray-600">{mealPlan[day][meal]?.readyInMinutes} mins</p>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Click to add recipe</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {selectedSlot && (
          <div className="mt-8">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for recipes..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleRecipeSelect(recipe)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 