'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Recipe, searchRecipes } from '../lib/spoonacular';
import RecipeCard from '../components/RecipeCard';
import RecipeDetail from '../components/RecipeDetail';

const CATEGORIES = {
  byDiet: [
    { id: 'all', label: 'All Recipes', value: '' },
    { id: 'vegetarian', label: 'Vegetarian', value: 'vegetarian' },
    { id: 'vegan', label: 'Vegan', value: 'vegan' },
    { id: 'gluten-free', label: 'Gluten Free', value: 'gluten-free' },
    { id: 'dairy-free', label: 'Dairy Free', value: 'dairy-free' },
    { id: 'low-sugar', label: 'Low Sugar', value: 'low-sugar' },
  ],
  byMeal: [
    { id: 'breakfast', label: 'Breakfast', value: 'breakfast' },
    { id: 'lunch', label: 'Lunch', value: 'lunch' },
    { id: 'dinner', label: 'Dinner', value: 'dinner' },
    { id: 'snack', label: 'Snacks', value: 'snack' },
    { id: 'dessert', label: 'Desserts', value: 'dessert' },
  ],
  byIngredients: [
    { id: 'meat', label: 'Meat', value: 'meat' },
    { id: 'fish', label: 'Fish', value: 'fish' },
    { id: 'vegetables', label: 'Vegetables', value: 'vegetables' },
    { id: 'grains', label: 'Grains & Pulses', value: 'grains' },
    { id: 'dairy', label: 'Dairy', value: 'dairy' },
  ],
};

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const observer = useRef<IntersectionObserver | null>(null);

  const loadRecipes = async (reset: boolean = false) => {
    if (isLoading || (!hasMore && !reset)) return;

    setIsLoading(true);
    try {
      const newOffset = reset ? 0 : offset;
      const response = await searchRecipes(searchQuery, newOffset, 12, selectedMealType, selectedDiet);
      setRecipes(prev => reset ? response.results : [...prev, ...response.results]);
      setOffset(newOffset + response.number);
      setHasMore(response.totalResults > newOffset + response.number);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const lastRecipeRef = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadRecipes();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  useEffect(() => {
    loadRecipes(true);
  }, [selectedDiet, selectedMealType]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadRecipes(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              {/* Search */}
              <form onSubmit={handleSearch} className="mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search recipes..."
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </form>

              {/* Diet Filters */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Diet</h3>
                <div className="space-y-2">
                  {CATEGORIES.byDiet.map((diet) => (
                    <label key={diet.id} className="flex items-center">
                      <input
                        type="radio"
                        name="diet"
                        checked={selectedDiet === diet.value}
                        onChange={() => setSelectedDiet(diet.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{diet.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Meal Type Filters */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Meal Type</h3>
                <div className="space-y-2">
                  {CATEGORIES.byMeal.map((meal) => (
                    <label key={meal.id} className="flex items-center">
                      <input
                        type="radio"
                        name="mealType"
                        checked={selectedMealType === meal.value}
                        onChange={() => setSelectedMealType(meal.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{meal.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Ingredient Filters */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Main Ingredient</h3>
                <div className="space-y-2">
                  {CATEGORIES.byIngredients.map((ingredient) => (
                    <label key={ingredient.id} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                      />
                      <span className="text-sm">{ingredient.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Recipes</h1>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className={`${
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }`}>
                {recipes.map((recipe, index) => (
                  <div
                    key={`${recipe.id}-${index}`}
                    ref={index === recipes.length - 1 ? lastRecipeRef : undefined}
                  >
                    <RecipeCard
                      recipe={recipe}
                      onClick={() => setSelectedRecipe(recipe)}
                      viewMode={viewMode}
                    />
                  </div>
                ))}
              </div>

              {isLoading && (
                <div className="text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
} 