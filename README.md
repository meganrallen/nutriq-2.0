# NutrIQ

NutrIQ is a modern web application for recipe tracking, meal planning, and grocery list management. Built with Next.js and powered by the Spoonacular API, it helps users discover recipes, plan their weekly meals, and maintain their nutritional goals.

## Features

- **Recipe Search & Discovery**
  - Browse through thousands of recipes
  - Filter by diet type, meal type, and ingredients
  - View detailed nutritional information
  - Grid and list view options

- **Meal Planning**
  - Weekly meal planner interface
  - Assign recipes to specific days and meal times
  - Quick view of daily nutritional totals
  - Easy meal plan modification

- **Grocery List Generation**
  - Automatically generate shopping lists from meal plans
  - Organize ingredients by category
  - Smart ingredient combination

- **Nutrition Tracking**
  - Track daily calorie and macro intake
  - View nutritional breakdown of meals
  - Progress bars for daily goals

## Tech Stack

- **Frontend Framework**: Next.js 15.3
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **API Integration**: Spoonacular
- **Image Optimization**: Next.js Image Component
- **TypeScript** for type safety

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Spoonacular API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/meganrallen/nutriq-2.0.git
   cd nutriq-2.0
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your Spoonacular API key:
   ```env
   NEXT_PUBLIC_SPOONACULAR_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
nutriq/
├── app/
│   ├── components/     # Reusable UI components
│   ├── lib/           # Utility functions and API integration
│   ├── recipes/       # Recipe search and filtering
│   ├── planner/       # Meal planning interface
│   └── list/          # Grocery list generation
├── public/           # Static assets
└── ...config files
```

## Usage

1. **Browse Recipes**
   - Use the search bar to find specific recipes
   - Apply filters for diet types and meal types
   - Click on a recipe to view details

2. **Plan Meals**
   - Navigate to the Planner
   - Click on any meal slot to add a recipe
   - View nutritional totals for each day

3. **Generate Grocery Lists**
   - Go to the List section
   - View automatically generated lists based on meal plan
   - Modify quantities as needed

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Recipe data provided by [Spoonacular API](https://spoonacular.com/food-api)
- Icons from Heroicons

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
