'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRecipeDetails, RecipeDetail as RecipeDetailType, getNutrientPerServing } from '../../lib/spoonacular';
import Image from 'next/image';

export default function RecipePage({ params }: { params: { id: string } }) {
  const [recipe, setRecipe] = useState<RecipeDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const details = await getRecipeDetails(parseInt(params.id));
        setRecipe(details);
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-4 rounded-lg">Loading recipe details...</div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Recipe not found</h1>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get macros for a single serving
  const caloriesPerServing = Math.round((recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0) / recipe.servings);
  const proteinPerServing = Math.round((recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0) / recipe.servings);
  const carbsPerServing = Math.round((recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0) / recipe.servings);
  const fatPerServing = Math.round((recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0) / recipe.servings);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="relative aspect-[16/9] w-full bg-gray-100">
            {!imageError ? (
              <Image
                src={recipe.image}
                alt={recipe.title}
                fill
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                className="object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg 
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2">No image available</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
            
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="font-medium">Recipe yields: {recipe.servings} servings</span>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 className="text-lg font-semibold mb-2">Nutrition Per Serving</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Calories</p>
                    <p className="font-semibold">{caloriesPerServing} kcal</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Protein</p>
                    <p className="font-semibold">{proteinPerServing}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Carbs</p>
                    <p className="font-semibold">{carbsPerServing}g</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fat</p>
                    <p className="font-semibold">{fatPerServing}g</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-gray-50 px-4 py-2 rounded-lg">
                  <p className="text-sm text-gray-600">Prep Time</p>
                  <p className="font-semibold">{recipe.readyInMinutes} mins</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
              <p className="text-sm text-gray-600 mb-4">For {recipe.servings} servings:</p>
              <ul className="grid grid-cols-1 gap-3">
                {recipe.extendedIngredients.map((ingredient, index) => (
                  <li 
                    key={`${recipe.id}-ingredient-${index}`}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-1 flex-shrink-0 text-xl text-blue-600">•</span>
                    <span>{ingredient.original}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
              {recipe.analyzedInstructions[0]?.steps.length > 0 ? (
                <ol className="space-y-4">
                  {recipe.analyzedInstructions[0].steps.map((step) => (
                    <li 
                      key={`${recipe.id}-step-${step.number}`}
                      className="flex gap-4"
                    >
                      <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0">
                        {step.number}
                      </span>
                      <p className="flex-1">{step.step}</p>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-500">No instructions available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 