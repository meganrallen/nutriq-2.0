import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Recipe, getHealthyRecipes, getRecipeDetails } from './spoonacular';

export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface MealPlanState {
  mealPlan: Record<DayOfWeek, Record<MealType, Recipe | null>>;
  setMeal: (day: DayOfWeek, meal: MealType, recipe: Recipe | null) => void;
  clearMealPlan: () => void;
  generateMealPlan: () => Promise<void>;
  isGenerating: boolean;
}

const initialMealPlan: Record<DayOfWeek, Record<MealType, Recipe | null>> = {
  monday: { breakfast: null, lunch: null, dinner: null },
  tuesday: { breakfast: null, lunch: null, dinner: null },
  wednesday: { breakfast: null, lunch: null, dinner: null },
  thursday: { breakfast: null, lunch: null, dinner: null },
  friday: { breakfast: null, lunch: null, dinner: null },
  saturday: { breakfast: null, lunch: null, dinner: null },
  sunday: { breakfast: null, lunch: null, dinner: null },
};

export const useMealPlanStore = create<MealPlanState>()(
  persist(
    (set, get) => ({
      mealPlan: initialMealPlan,
      isGenerating: false,
      setMeal: async (day, meal, recipe) => {
        // Always fetch full recipe details if not present
        let fullRecipe = recipe;
        if (recipe && !recipe.extendedIngredients) {
          fullRecipe = await getRecipeDetails(recipe.id);
        }
        set((state) => ({
          mealPlan: {
            ...state.mealPlan,
            [day]: {
              ...state.mealPlan[day],
              [meal]: fullRecipe,
            },
          },
        }));
        // Automatically generate meal plan when a meal is added
        const currentMealPlan = get().mealPlan;
        const hasAnyMeals = Object.values(currentMealPlan).some(dayMeals => 
          Object.values(dayMeals).some(meal => meal !== null)
        );
        if (hasAnyMeals && !get().isGenerating) {
          get().generateMealPlan();
        }
      },
      clearMealPlan: () => set({ mealPlan: initialMealPlan }),
      generateMealPlan: async () => {
        set({ isGenerating: true });
        try {
          const currentMealPlan = get().mealPlan;
          const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          const meals: MealType[] = ['breakfast', 'lunch', 'dinner'];
          
          // Generate meals for each empty slot
          for (const day of days) {
            for (const meal of meals) {
              if (!currentMealPlan[day][meal]) {
                const response = await getHealthyRecipes(0, 1, meal);
                if (response.results.length > 0) {
                  // Fetch full recipe details
                  const fullRecipe = await getRecipeDetails(response.results[0].id);
                  if (fullRecipe) {
                    set((state) => ({
                      mealPlan: {
                        ...state.mealPlan,
                        [day]: {
                          ...state.mealPlan[day],
                          [meal]: fullRecipe,
                        },
                      },
                    }));
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error('Error generating meal plan:', error);
        } finally {
          set({ isGenerating: false });
        }
      },
    }),
    {
      name: 'meal-plan-storage',
      partialize: (state) => ({ mealPlan: state.mealPlan }),
    }
  )
); 