'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Recipe, getRecipeImageURL } from '../lib/spoonacular';
import { getNutrientValue } from '../lib/spoonacular';

function getBestRecipeImage(recipe: Recipe) {
  if (recipe.image?.startsWith('http')) {
    return recipe.image;
  }
  if (recipe.image && recipe.image.match(/\.(jpg|jpeg|png|webp)$/i)) {
    return `https://spoonacular.com/recipeImages/${recipe.image}`;
  }
  return getRecipeImageURL(recipe.id);
}

interface RecipeCardProps {
  recipe: Recipe;
  onClick: () => void;
  viewMode?: 'grid' | 'list';
  showMacrosPerServing?: boolean;
  compact?: boolean;
}

export default function RecipeCard({ recipe, onClick, viewMode = 'grid', showMacrosPerServing = false, compact = false }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);

  const servings = recipe.servings || 1;
  const calories = getNutrientValue(recipe, 'Calories');
  const protein = getNutrientValue(recipe, 'Protein');
  const fat = getNutrientValue(recipe, 'Fat');
  const carbs = getNutrientValue(recipe, 'Carbohydrates');
  const caloriesPerServing = Math.round(calories / servings);
  const proteinPerServing = Math.round(protein / servings);
  const fatPerServing = Math.round(fat / servings);
  const carbsPerServing = Math.round(carbs / servings);

  // OpenAI integration for smart macros and description
  const [aiMacros, setAiMacros] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function fetchAI() {
      setAiLoading(true);
      // Smart macro calculation
      const macroPrompt = `Estimate the calories, protein, carbs, and fat per serving for this recipe. Only output in the format: Calories: X | Protein: Yg | Carbs: Zg | Fat: Wg.\nTitle: ${recipe.title}\nIngredients: ${recipe.extendedIngredients?.map(i => i.original).join(', ')}`;
      // Recipe description
      const descPrompt = `Write a 1-2 sentence appetizing description for this recipe: ${recipe.title}.`;
      try {
        const [macroRes, descRes] = await Promise.all([
          fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: macroPrompt }),
          }).then(r => r.json()),
          fetch('/api/openai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: descPrompt }),
          }).then(r => r.json()),
        ]);
        if (!ignore) {
          setAiMacros(macroRes.result);
          setAiDescription(descRes.result);
        }
      } catch (e) {
        if (!ignore) {
          setAiMacros('AI macro estimate unavailable');
          setAiDescription('AI description unavailable');
        }
      } finally {
        if (!ignore) setAiLoading(false);
      }
    }
    fetchAI();
    return () => { ignore = true; };
  }, [recipe]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('RecipeCard clicked:', recipe.title);
    onClick();
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className="cursor-pointer py-6"
        style={{ border: 'none', marginBottom: 0 }}
      >
        <div className="font-bold text-lg leading-tight">{recipe.title}</div>
        <div className="text-sm text-gray-700">Ready in {recipe.readyInMinutes} mins</div>
        <div className="text-sm text-gray-700">{servings} servings</div>
        <div className="text-sm text-gray-700">
          Calories: {caloriesPerServing} | Protein: {proteinPerServing}g | Carbs: {carbsPerServing}g | Fat: {fatPerServing}g
        </div>
        {recipe.diets && recipe.diets.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {recipe.diets.join(' | ')}
          </div>
        )}
        {/* No AI description or macros here */}
      </div>
    );
  }

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
          {showMacrosPerServing && (
            <div className="flex gap-4 mt-2 text-xs text-gray-700">
              <span>Calories: {caloriesPerServing}</span>
              <span>Protein: {proteinPerServing}g</span>
              <span>Carbs: {carbsPerServing}g</span>
              <span>Fat: {fatPerServing}g</span>
            </div>
          )}
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
      role="button"
      tabIndex={0}
      className="flex bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer min-h-[160px] m-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
      style={{ background: '#fff' }}
    >
      <div className="relative w-44 h-36 flex-shrink-0 m-4 rounded-xl overflow-hidden shadow-md border border-gray-100 group-hover:border-blue-300 transition-all">
        {!imageError ? (
          <Image
            src={getBestRecipeImage(recipe)}
            alt={recipe.title}
            fill
            className="object-cover rounded-xl"
            onError={() => setImageError(true)}
            loading="lazy"
            priority={false}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm rounded-xl">
            No image available
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center py-6 pr-6 pl-2">
        <h3 className="font-bold text-xl text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
          {recipe.title}
        </h3>
        {showMacrosPerServing && (
          <div className="flex gap-4 mt-2 text-xs text-gray-700">
            <span>Calories: {caloriesPerServing}</span>
            <span>Protein: {proteinPerServing}g</span>
            <span>Carbs: {carbsPerServing}g</span>
            <span>Fat: {fatPerServing}g</span>
          </div>
        )}
      </div>
    </div>
  );
} 