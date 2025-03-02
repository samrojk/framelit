import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { CategoryGrid } from '../components/CategoryGrid';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { Wallpaper } from '../types';
import { searchPhotos } from '../services/unsplash';
import { categories } from '../data/categories';

export function HomePage() {
  const [trendingWallpapers, setTrendingWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrendingWallpapers() {
      setLoading(true);
      try {
        // Get a subset of categories to ensure diversity
        const diverseCategories = [...categories]
          .sort(() => 0.5 - Math.random()) // Shuffle the categories
          .slice(0, 4); // Take 4 random categories
        
        // Add some general trending terms to ensure good variety
        const searchTerms = [
          'trending wallpaper',
          'popular wallpaper',
          ...diverseCategories.map(cat => cat.name.toLowerCase())
        ];
        
        // Create promises for all search queries
        const searchPromises = searchTerms.map(term => 
          searchPhotos(term, 1, 3) // Get 3 wallpapers per term
        );
        
        // Wait for all searches to complete
        const results = await Promise.all(searchPromises);
        
        // Create a Set to track IDs we've already seen to prevent duplicates
        const seenIds = new Set<string>();
        const allWallpapers: Wallpaper[] = [];
        
        // Process each result
        results.forEach(result => {
          if (result.results && result.results.length > 0) {
            const wallpapers = result.results
              .filter(photo => {
                // Only include photos with unique IDs
                if (seenIds.has(photo.id)) {
                  return false;
                }
                seenIds.add(photo.id);
                return true;
              })
              .map(photo => ({
                id: photo.id,
                title: photo.description || photo.alt_description || 'Untitled',
                url: photo.urls.full,
                thumbnail: photo.urls.regular + '?w=800&q=80',
                author: photo.user.name,
                category: 'Trending',
                tags: photo.tags?.map(tag => tag.title) || [],
                resolutions: ['1080p', '2K', '4K'],
                downloads: photo.downloads || 0,
                likes: photo.likes || 0,
                createdAt: photo.created_at,
                colors: photo.color ? [photo.color] : [],
                downloadLocation: photo.links.download_location,
              }));
            
            allWallpapers.push(...wallpapers);
          }
        });
        
        // Shuffle the wallpapers for better variety
        const shuffledWallpapers = allWallpapers
          .sort(() => 0.5 - Math.random())
          .slice(0, 12); // Limit to 12 wallpapers
        
        setTrendingWallpapers(shuffledWallpapers);
      } catch (err) {
        console.error('Failed to fetch trending wallpapers:', err);
        setError('Failed to load trending wallpapers');
      } finally {
        setLoading(false);
      }
    }

    fetchTrendingWallpapers();
  }, []);

  return (
    <main className="pt-16">
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section>
          <h2 className="text-3xl font-bold mb-8">Categories</h2>
          <CategoryGrid />
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-8">Trending Wallpapers</h2>
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : (
            <WallpaperGrid 
              wallpapers={trendingWallpapers} 
              showMetadata={true}
            />
          )}
        </section>
      </div>
    </main>
  );
}