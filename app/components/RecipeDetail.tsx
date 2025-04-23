'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Recipe } from '../lib/spoonacular';
import { getNutrientValue } from '../lib/spoonacular';

interface RecipeDetailProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function RecipeDetail({ recipe, onClose }: RecipeDetailProps) {
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Add event listener for escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Don't render on server side
  if (!mounted) return null;

  const calories = getNutrientValue(recipe, 'Calories');
  const protein = getNutrientValue(recipe, 'Protein');
  const fat = getNutrientValue(recipe, 'Fat');
  const carbs = getNutrientValue(recipe, 'Carbohydrates');

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{recipe.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className={`relative h-64 ${imageError ? 'bg-gray-200' : ''}`}>
              {!imageError ? (
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover rounded-lg"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No image available
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Nutrition Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Calories</div>
                  <div className="text-xl font-semibold">{Math.round(calories)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Protein</div>
                  <div className="text-xl font-semibold">{Math.round(protein)}g</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Fat</div>
                  <div className="text-xl font-semibold">{Math.round(fat)}g</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Carbs</div>
                  <div className="text-xl font-semibold">{Math.round(carbs)}g</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Ingredients</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipe.extendedIngredients?.map((ingredient, index) => (
                <li
                  key={`${recipe.id}-ingredient-${index}`}
                  className="flex items-center gap-2 text-gray-700"
                >
                  <span className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </span>
                  {ingredient.name} - {ingredient.amount} {ingredient.unit}
                </li>
              ))}
            </ul>
          </div>

          {recipe.analyzedInstructions?.[0]?.steps && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Instructions</h3>
              <ol className="space-y-4">
                {recipe.analyzedInstructions[0].steps.map((step) => (
                  <li
                    key={`${recipe.id}-step-${step.number}`}
                    className="flex gap-4"
                  >
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                      {step.number}
                    </span>
                    <p className="text-gray-700">{step.step}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 