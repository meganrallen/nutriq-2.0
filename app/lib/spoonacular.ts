const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

// Image size options from Spoonacular
export const IMAGE_SIZES = {
  THUMBNAIL: '90x90',
  SMALL: '240x240',
  MEDIUM: '312x312',
  LARGE: '480x480',
  EXTRA_LARGE: '636x636',
} as const;

export const getRecipeImageURL = (id: number, size: string = IMAGE_SIZES.LARGE): string => {
  return `https://spoonacular.com/recipeImages/${id}-${size}.jpg`;
};

export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  servings: number;
  readyInMinutes: number;
  cuisines: string[];
  diets: string[];
  dishTypes: string[];
  sourceUrl: string;
  nutrition?: {
    nutrients: Nutrient[];
  };
  extendedIngredients?: {
    id: number;
    name: string;
    amount: number;
    unit: string;
    original: string;
  }[];
  analyzedInstructions?: {
    steps: {
      number: number;
      step: string;
    }[];
  }[];
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
}

export interface RecipeDetail extends Recipe {
  summary: string;
  instructions: string;
}

export const getNutrientPerServing = (recipe: RecipeDetail, nutrientName: string, desiredServings: number = 1): number => {
  const nutrient = recipe.nutrition?.nutrients?.find(n => n.name === nutrientName);
  if (!nutrient) return 0;
  // Calculate the amount for desired servings and round to whole number
  const amountPerServing = (nutrient.amount / recipe.servings) * desiredServings;
  return Math.round(amountPerServing);
};

export interface DietaryFilters {
  diet?: string;
  intolerances?: string[];
  maxCalories?: number;
  minProtein?: number;
  excludeIngredients?: string[];
  includeIngredients?: string[];
  mealType?: string;
  maxSugar?: number;
  maxFat?: number;
  minFiber?: number;
}

export const DIETARY_OPTIONS = {
  diets: [
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'ketogenic', label: 'Keto' },
    { value: 'gluten-free', label: 'Gluten Free' },
    { value: 'pescetarian', label: 'Pescetarian' },
  ],
  mealTypes: [
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' },
  ],
  intolerances: [
    { value: 'dairy', label: 'Dairy' },
    { value: 'egg', label: 'Egg' },
    { value: 'gluten', label: 'Gluten' },
    { value: 'grain', label: 'Grain' },
    { value: 'peanut', label: 'Peanut' },
    { value: 'seafood', label: 'Seafood' },
    { value: 'shellfish', label: 'Shellfish' },
    { value: 'soy', label: 'Soy' },
    { value: 'tree-nut', label: 'Tree Nut' },
    { value: 'wheat', label: 'Wheat' },
  ],
} as const;

export interface SearchRecipesResponse {
  results: Recipe[];
  offset: number;
  number: number;
  totalResults: number;
}

export const getNutrientValue = (recipe: Recipe, name: string): number => {
  const nutrient = recipe.nutrition?.nutrients?.find(n => n.name === name);
  return nutrient?.amount || 0;
};

export async function searchRecipes(
  query: string,
  offset: number = 0,
  limit: number = 12,
  mealType?: string,
  diet?: string,
  excludeIngredients?: string,
  filters?: DietaryFilters
): Promise<SearchRecipesResponse> {
  if (!API_KEY) {
    console.error('Spoonacular API key is not set');
    return { results: [], offset: 0, number: 0, totalResults: 0 };
  }

  try {
    let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${encodeURIComponent(
      query
    )}&addRecipeNutrition=true&number=${limit}&offset=${offset}&sort=random`;

    if (mealType) {
      url += `&type=${mealType}`;
    }

    if (diet) {
      url += `&diet=${diet}`;
    }

    if (excludeIngredients) {
      url += `&excludeIngredients=${encodeURIComponent(excludeIngredients)}`;
    }

    // Add health-related filters
    if (filters) {
      if (filters.maxCalories) {
        url += `&maxCalories=${filters.maxCalories}`;
      }
      if (filters.minProtein) {
        url += `&minProtein=${filters.minProtein}`;
      }
      if (filters.maxSugar) {
        url += `&maxSugar=${filters.maxSugar}`;
      }
      if (filters.maxFat) {
        url += `&maxFat=${filters.maxFat}`;
      }
      if (filters.minFiber) {
        url += `&minFiber=${filters.minFiber}`;
      }
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      results: data.results,
      offset: data.offset,
      number: data.number,
      totalResults: data.totalResults
    };
  } catch (error) {
    console.error('Error searching recipes:', error);
    return { results: [], offset: 0, number: 0, totalResults: 0 };
  }
}

export async function getHealthyRecipes(
  offset: number = 0,
  limit: number = 12,
  mealType?: string
): Promise<SearchRecipesResponse> {
  const healthyFilters: DietaryFilters = {
    maxCalories: 600,
    minProtein: 15,
    maxSugar: 20,
    maxFat: 30,
    minFiber: 5
  };

  return searchRecipes('', offset, limit, mealType, undefined, undefined, healthyFilters);
}

export async function getRecipeDetails(id: number): Promise<Recipe | null> {
  if (!API_KEY) {
    console.error('Spoonacular API key is not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}&addRecipeNutrition=true`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
}

export async function getRandomRecipe(): Promise<Recipe | null> {
  if (!API_KEY) {
    console.error('Spoonacular API key is not set');
    return null;
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/random?apiKey=${API_KEY}&number=1&addRecipeNutrition=true`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.recipes[0];
  } catch (error) {
    console.error('Error fetching random recipe:', error);
    return null;
  }
}

export async function findRecipesByIngredients(
  ingredients: string[],
  number: number = 5
): Promise<Recipe[]> {
  if (!API_KEY) {
    console.error('Spoonacular API key is not set');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${API_KEY}&ingredients=${ingredients.join(',')}&number=${number}&addRecipeNutrition=true`
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error finding recipes by ingredients:', error);
    return [];
  }
}