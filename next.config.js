/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['spoonacular.com', 'img.spoonacular.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.spoonacular.com',
        pathname: '/**',
      },
    ],
    unoptimized: true,
    minimumCacheTTL: 60,
  },
};

module.exports = nextConfig; 