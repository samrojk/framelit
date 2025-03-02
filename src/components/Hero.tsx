import React from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <div className="relative h-[80vh] overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564"
        alt="Space background"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 px-4">
          Stunning Wallpapers for Every Screen
        </h1>
        <p className="text-lg md:text-xl text-center mb-8 max-w-2xl px-4">
          Discover and download high-quality wallpapers curated for you
        </p>
        <Link 
          to="/category/nature"
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <Compass className="w-5 h-5" />
          <span>Explore Now</span>
        </Link>
      </div>
    </div>
  );
}