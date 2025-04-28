'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline';

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <HomeIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link
            href="/recipes"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/recipes') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <MagnifyingGlassIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Search</span>
          </Link>
          
          <Link
            href="/profile"
            className={`flex flex-col items-center justify-center w-full h-full ${
              isActive('/profile') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <UserIcon className="w-6 h-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 