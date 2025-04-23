import { Metadata } from 'next';

export const siteMetadata = {
  title: 'NutrIQ - Recipe Planning Made Easy',
  description: 'Plan your meals and generate grocery lists with NutrIQ',
} as const;

export const metadata: Metadata = {
  title: 'NutrIQ - Smart Recipe Tracking',
  description: 'Track your recipes, plan your meals, and manage your nutrition with NutrIQ.',
  keywords: ['recipes', 'meal planning', 'nutrition', 'cooking', 'food'],
  icons: {
    icon: '/favicon.ico',
  },
}; 