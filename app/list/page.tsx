'use client';

import { useMealPlanStore } from '../lib/store';
import { useMemo, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface GroceryItem {
  name: string;
  amount: number;
  unit: string;
  checked: boolean;
  section: string;
}

function getSection(ingredientName: string): string {
  const produce = ['lettuce', 'tomato', 'onion', 'apple', 'banana', 'carrot', 'spinach', 'broccoli'];
  const dairy = ['milk', 'cheese', 'yogurt', 'butter'];
  const meat = ['chicken', 'beef', 'pork', 'turkey'];
  const bakery = ['bread', 'bun', 'roll'];
  const pantry = ['rice', 'pasta', 'beans', 'oil', 'flour', 'sugar'];
  // Add more as needed

  const name = ingredientName.toLowerCase();
  if (produce.some(item => name.includes(item))) return 'Produce';
  if (dairy.some(item => name.includes(item))) return 'Dairy';
  if (meat.some(item => name.includes(item))) return 'Meat';
  if (bakery.some(item => name.includes(item))) return 'Bakery';
  if (pantry.some(item => name.includes(item))) return 'Pantry';
  return 'Other';
}

async function getCleanedGroceryList(ingredients: { name: string; amount: number; unit: string }[]) {
  const prompt = `You are a helpful grocery assistant. Given this list of ingredients (with amounts and units), merge similar or related items (e.g., salt and sea salt, or different types of onions), standardize names and amounts, and organize them into these grocery store sections: Produce, Meat/Poultry, Dairy, Bakery, Pantry, Other. Sum all amounts for the same ingredient, even if the name is slightly different. Output the result as markdown with section headers (##) and a bullet list for each section. Ensure that all sections (Produce, Meat/Poultry, Dairy, Bakery, Pantry, Other) are present in the output, even if some are empty, and distribute ingredients appropriately. If an ingredient does not fit any section, place it under 'Other'. Here is the list:\n\n${ingredients.map(i => `${i.amount ? i.amount + ' ' : ''}${i.unit ? i.unit + ' ' : ''}${i.name}`).join('\n')}`;

  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  return data.result;
}

export default function GroceryListPage() {
  const { mealPlan } = useMealPlanStore();
  const [cleanedList, setCleanedList] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [editingLine, setEditingLine] = useState<number | null>(null);
  const [editedLines, setEditedLines] = useState<{ [k: number]: string }>({});

  // Group and sum all ingredients from all recipes in the meal plan
  const groupedIngredients = useMemo(() => {
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

  // Only call OpenAI and render when ingredients are ready
  useEffect(() => {
    if (groupedIngredients.length === 0) {
      setCleanedList('');
      return;
    }
    setLoadingAI(true);
    getCleanedGroceryList(groupedIngredients)
      .then(setCleanedList)
      .catch(() => setCleanedList('Error generating cleaned list.'))
      .finally(() => setLoadingAI(false));
  }, [JSON.stringify(groupedIngredients)]);

  // Parse the AI markdown into lines for editing
  const lines = useMemo(() => cleanedList.split('\n'), [cleanedList]);

  // Handle editing
  const handleLineClick = (idx: number) => setEditingLine(idx);
  const handleLineChange = (idx: number, value: string) => setEditedLines(l => ({ ...l, [idx]: value }));
  const handleLineBlur = (idx: number) => setEditingLine(null);
  const handleLineKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') setEditingLine(null);
  };

  // Rebuild the markdown with edits
  const editedMarkdown = lines
    .map((line, idx) => (editingLine === idx ? editedLines[idx] ?? line : editedLines[idx] ?? line))
    .join('\n');

  // Only show the AI list, with checkboxes and editing
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Grocery List</h1>
      <div className="bg-white rounded-lg shadow p-6">
        {loadingAI ? (
          <div className="text-blue-600">Organizing your grocery list...</div>
        ) : cleanedList ? (
          <>
            <div className="prose prose-sm max-w-none">
              {lines.map((line, idx) => {
                if (editingLine === idx) {
                  return (
                    <input
                      key={idx}
                      value={editedLines[idx] ?? line}
                      onChange={e => handleLineChange(idx, e.target.value)}
                      onBlur={() => handleLineBlur(idx)}
                      onKeyDown={e => handleLineKeyDown(idx, e)}
                      className="w-full border rounded px-2 py-1 mb-1"
                      autoFocus
                    />
                  );
                }
                return (
                  <div key={idx} onClick={() => handleLineClick(idx)} style={{ cursor: 'pointer' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{editedLines[idx] ?? line}</ReactMarkdown>
                  </div>
                );
              })}
            </div>
            {/* DEBUG: Raw AI response */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-300 rounded">
              <h3 className="font-semibold mb-2">Debug: Raw AI Response</h3>
              <pre style={{ fontSize: '0.8em', overflowX: 'auto' }}>{cleanedList}</pre>
            </div>
          </>
        ) : (
          <div className="text-gray-500">No grocery list yet. Add meals to your planner to get started!</div>
        )}
      </div>
    </div>
  );
} 