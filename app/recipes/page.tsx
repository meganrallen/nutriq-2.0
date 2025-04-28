'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Recipe, searchRecipes, getHealthyRecipes } from '../lib/spoonacular';
import RecipeCard from '../components/RecipeCard';
import RecipeDetail from '../components/RecipeDetail';
import { useRouter } from 'next/navigation';

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const CATEGORIES = {
  byDiet: [
    { id: 'vegetarian', label: 'Vegetarian', value: 'vegetarian' },
    { id: 'vegan', label: 'Vegan', value: 'vegan' },
    { id: 'gluten-free', label: 'Gluten Free', value: 'gluten-free' },
    { id: 'dairy-free', label: 'Dairy Free', value: 'dairy-free' },
    { id: 'sugar-free', label: 'Sugar Free', value: 'sugar-free' },
    { id: 'paleo', label: 'Paleo', value: 'paleo' },
    { id: 'keto', label: 'Keto', value: 'ketogenic' },
    { id: 'fodmap', label: 'FODMAP', value: 'fodmap' },
    { id: 'whole30', label: 'Whole30', value: 'whole30' },
    { id: 'mediterranean', label: 'Mediterranean', value: 'mediterranean' },
  ],
  byMeal: [
    { id: 'breakfast', label: 'Breakfast', value: 'breakfast' },
    { id: 'lunch', label: 'Lunch', value: 'lunch' },
    { id: 'dinner', label: 'Dinner', value: 'dinner' },
    { id: 'snack', label: 'Snacks', value: 'snack' },
    { id: 'dessert', label: 'Desserts', value: 'dessert' },
  ],
};

// In-memory cache for search results
const searchCache = new Map<string, Recipe[]>();

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedMealTypes, setSelectedMealTypes] = useState<string[]>([]);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [apiQuotaExceeded, setApiQuotaExceeded] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const router = useRouter();

  // Only list view, no grid/list toggle
  // Load 10 recipes at a time
  const RECIPES_PER_PAGE = 10;

  // Load recipes on mount and when filters change
  useEffect(() => {
    loadRecipes(true);
    // eslint-disable-next-line
  }, [selectedDiets, selectedMealTypes]);

  const loadRecipes = async (reset: boolean = false) => {
    if (isLoading || (!hasMore && !reset) || apiQuotaExceeded) return;
    setIsLoading(true);
    try {
      const newOffset = reset ? 0 : offset;
      // Use selected filters for diet and meal type
      const mealType = selectedMealTypes.join(',');
      const response = await getHealthyRecipes(
        newOffset,
        RECIPES_PER_PAGE,
        mealType
      );
      setRecipes(prev => reset ? response.results : [...prev, ...response.results]);
      setOffset(newOffset + response.number);
      setHasMore(response.totalResults > newOffset + response.number);
    } catch (error: any) {
      if (error?.message?.includes('402')) {
        setApiQuotaExceeded(true);
      }
      console.error('Error loading recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Infinite scroll: load more when last recipe is visible
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

  const handleDietChange = (diet: string) => {
    setSelectedDiets(prev => 
      prev.includes(diet) 
        ? prev.filter(d => d !== diet)
        : [...prev, diet]
    );
  };

  const handleMealTypeChange = (mealType: string) => {
    setSelectedMealTypes(prev =>
      prev.includes(mealType)
        ? prev.filter(m => m !== mealType)
        : [...prev, mealType]
    );
  };

  const handleIngredientKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentIngredient.trim()) {
      e.preventDefault();
      setExcludedIngredients(prev => [...prev, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (ingredient: string) => {
    setExcludedIngredients(prev => prev.filter(i => i !== ingredient));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex gap-0">
          {/* Sidebar */}
          <aside className="w-80 flex-shrink-0 pr-0">
            <div className="bg-navy-900 rounded-xl shadow-lg p-8 sticky top-20 text-white flex flex-col gap-10 h-fit min-h-[80vh]">
              {/* Diet Filters */}
              <div>
                <h3 className="font-semibold mb-2 text-lg">Diet</h3>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.byDiet.map((diet) => (
                    <label key={diet.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedDiets.includes(diet.value)}
                        onChange={() => handleDietChange(diet.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{diet.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Meal Type Filters */}
              <div>
                <h3 className="font-semibold mb-2 text-lg mt-6">Meal Type</h3>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.byMeal.map((meal) => (
                    <label key={meal.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedMealTypes.includes(meal.value)}
                        onChange={() => handleMealTypeChange(meal.value)}
                        className="mr-2"
                      />
                      <span className="text-sm">{meal.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-6">Recipes</h1>
            <div className="flex flex-col gap-2">
              {recipes.map((recipe, index) => (
                <div
                  key={`${recipe.id}-${index}`}
                  ref={index === recipes.length - 1 ? lastRecipeRef : undefined}
                >
                  <RecipeCard
                    recipe={recipe}
                    onClick={() => router.push(`/recipe/${recipe.id}`)}
                    viewMode="list"
                    showMacrosPerServing={true}
                    compact={true}
                  />
                </div>
              ))}
            </div>
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            )}
            {apiQuotaExceeded && (
              <div className="text-red-500 text-center mt-4">
                API quota exceeded. Please try again tomorrow or upgrade your Spoonacular plan.
              </div>
            )}
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