'use client';

import { useEffect, useState } from 'react';
import { useMealPlanStore, DayOfWeek, MealType } from './lib/store';
import { Recipe, getRandomRecipe } from './lib/spoonacular';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { mealPlan } = useMealPlanStore();
  const router = useRouter();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;
  const todaysMeals = mealPlan[today] || {};

  const [greeting, setGreeting] = useState('');
  const [recipeOfTheDay, setRecipeOfTheDay] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    const fetchRecipeOfTheDay = async () => {
      try {
        const recipe = await getRandomRecipe();
        setRecipeOfTheDay(recipe);
      } catch (error) {
        console.error('Error fetching recipe of the day:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeOfTheDay();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{greeting}!</h1>
      
      {/* Recipe of the Day Section */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recipe of the Day</h2>
        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        ) : recipeOfTheDay ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="relative h-48">
              <Image
                src={recipeOfTheDay.image}
                alt={recipeOfTheDay.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{recipeOfTheDay.title}</h3>
              <p className="text-gray-600 text-sm mb-4">
                Ready in {recipeOfTheDay.readyInMinutes} minutes • {recipeOfTheDay.servings} servings
              </p>
              <button
                onClick={() => router.push(`/recipe/${recipeOfTheDay.id}`)}
                className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                View Recipe
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Unable to load recipe of the day</p>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Today's Meals</h2>
        {Object.entries(todaysMeals).length > 0 ? (
          <div className="space-y-4">
            {(Object.entries(todaysMeals) as [MealType, Recipe | null][]).map(([mealType, recipe]) => (
              <div key={mealType} className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-medium capitalize mb-2">{mealType}</h3>
                {recipe ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 relative">
                      <Image
                        src={recipe.image}
                        alt={recipe.title}
                        fill
                        className="rounded-md object-cover"
                        loading="lazy"
                        priority={false}
                      />
                    </div>
                    <div>
                      <p className="font-medium">{recipe.title}</p>
                      <p className="text-sm text-gray-600">
                        Ready in {recipe.readyInMinutes} minutes
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No meal planned</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-4">No meals planned for today</p>
            <button 
              onClick={() => router.push('/planner')}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Plan Today's Meals
            </button>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button 
              onClick={() => router.push('/recipes')}
              className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Browse Recipes
            </button>
            <button 
              onClick={() => router.push('/planner')}
              className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              View Meal Plan
            </button>
            <button 
              onClick={() => router.push('/list')}
              className="w-full text-left px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Generate Grocery List
            </button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Nutrition Today</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Calories</span>
              <span className="font-medium">0 / 2000</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 rounded-full h-2" style={{ width: '0%' }}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Protein</span>
              <span className="font-medium">0g / 150g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 rounded-full h-2" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 