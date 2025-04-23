'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Recipe } from '../lib/spoonacular';
import { getNutrientValue } from '../lib/spoonacular';

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  viewMode?: 'grid' | 'list';
}

export default function RecipeCard({ recipe, onClick, viewMode = 'grid' }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);

  const calories = getNutrientValue(recipe, 'Calories');
  const protein = getNutrientValue(recipe, 'Protein');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={handleClick}
        className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flex"
      >
        <div className="relative w-48 h-32 flex-shrink-0">
          {!imageError ? (
            <Image
              src={recipe.image}
              alt={recipe.title}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
              priority={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
              No image available
            </div>
          )}
        </div>
        <div className="p-4 flex-1">
          <h3 className="font-medium text-lg mb-2">{recipe.title}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Ready in {recipe.readyInMinutes} mins</span>
            <span>{recipe.servings} servings</span>
          </div>
          {recipe.diets && recipe.diets.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {recipe.diets.slice(0, 3).map((diet) => (
                <span
                  key={diet}
                  className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                >
                  {diet}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative w-full h-48">
        {!imageError ? (
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            No image available
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg mb-2">{recipe.title}</h3>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Ready in {recipe.readyInMinutes} mins</span>
          <span>{recipe.servings} servings</span>
        </div>
        {recipe.diets && recipe.diets.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {recipe.diets.slice(0, 2).map((diet) => (
              <span
                key={diet}
                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
              >
                {diet}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 