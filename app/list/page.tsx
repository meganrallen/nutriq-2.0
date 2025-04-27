'use client';

import { useMealPlanStore } from '../lib/store';
import { useMemo } from 'react';

export default function GroceryListPage() {
  const { mealPlan } = useMealPlanStore();

  // Aggregate all ingredients from all recipes in the meal plan
  const groceryList = useMemo(() => {
    const items: Record<string, { name: string; amount: number; unit: string }> = {};
    Object.values(mealPlan).forEach(dayMeals => {
      Object.values(dayMeals).forEach(recipe => {
        if (recipe && recipe.extendedIngredients) {
          recipe.extendedIngredients.forEach(ing => {
            const key = ing.name.toLowerCase() + '|' + (ing.unit || '');
            if (!items[key]) {
              items[key] = { name: ing.name, amount: ing.amount, unit: ing.unit };
            } else {
              items[key].amount += ing.amount;
            }
          });
        }
      });
    });
    return Object.values(items);
  }, [mealPlan]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Grocery List</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {groceryList.length === 0 ? (
          <p className="text-gray-500 text-center">
            Your grocery list will be generated based on your meal plan.<br />
            Add some meals to your planner to get started!
          </p>
        ) : (
          <ul className="list-disc pl-6 space-y-1">
            {groceryList.map((item, idx) => (
              <li key={idx} className="text-gray-800">
                {item.amount ? `${item.amount} ` : ''}{item.unit ? `${item.unit} ` : ''}{item.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 