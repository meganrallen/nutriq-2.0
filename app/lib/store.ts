import { create } from 'zustand';
import { Recipe } from './spoonacular';

export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface MealPlanState {
  mealPlan: Record<DayOfWeek, Record<MealType, Recipe | null>>;
  setMeal: (day: DayOfWeek, meal: MealType, recipe: Recipe | null) => void;
  clearMealPlan: () => void;
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

export const useMealPlanStore = create<MealPlanState>((set) => ({
  mealPlan: initialMealPlan,
  setMeal: (day, meal, recipe) =>
    set((state) => ({
      mealPlan: {
        ...state.mealPlan,
        [day]: {
          ...state.mealPlan[day],
          [meal]: recipe,
        },
      },
    })),
  clearMealPlan: () => set({ mealPlan: initialMealPlan }),
})); 