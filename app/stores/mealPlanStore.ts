import { create } from 'zustand';
import { Recipe } from '../lib/spoonacular';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface MealPlan {
  [key: string]: {
    [key in MealType]?: Recipe;
  };
}

interface MealPlanStore {
  mealPlan: MealPlan;
  addMeal: (day: DayOfWeek, mealType: MealType, recipe: Recipe) => void;
  removeMeal: (day: DayOfWeek, mealType: MealType) => void;
  clearMealPlan: () => void;
}

export const useMealPlanStore = create<MealPlanStore>((set) => ({
  mealPlan: {},
  addMeal: (day, mealType, recipe) =>
    set((state) => ({
      mealPlan: {
        ...state.mealPlan,
        [day]: {
          ...state.mealPlan[day],
          [mealType]: recipe,
        },
      },
    })),
  removeMeal: (day, mealType) =>
    set((state) => {
      const dayMeals = { ...state.mealPlan[day] };
      delete dayMeals[mealType];
      return {
        mealPlan: {
          ...state.mealPlan,
          [day]: dayMeals,
        },
      };
    }),
  clearMealPlan: () => set({ mealPlan: {} }),
})); 