import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { getCategoryPhotos } from '../services/unsplash';
import { Wallpaper } from '../types';

export function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [loading, setLoading] = useState(true);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (!category) {
      setError('Category not found');
      setLoading(false);
      return;
    }

    async function fetchCategoryWallpapers() {
      setLoading(true);
      setError(null);
      try {
        const photos = await getCategoryPhotos(category, 1);
        if (photos.length === 0) {
          setError(
            !import.meta.env.VITE_UNSPLASH_ACCESS_KEY
              ? 'Please set up your Unsplash API key to view wallpapers'
              : 'No wallpapers found for this category'
          );
        } else {
          setWallpapers(photos);
          setHasMore(photos.length === 16); // Updated to match the new count
        }
      } catch (err) {
        setError('Failed to load wallpapers. Please try again later.');
        console.error('Category page error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryWallpapers();
  }, [category]);

  const loadMore = async () => {
    if (!category || loading) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const photos = await getCategoryPhotos(category, nextPage);
      if (photos.length > 0) {
        setWallpapers(prev => [...prev, ...photos]);
        setHasMore(photos.length === 16); // Updated to match the new count
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Load more error:', err);
      setError('Failed to load more wallpapers');
    } finally {
      setLoading(false);
    }
  };

  if (!category) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
          Category not found
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <h1 className="text-4xl font-bold mb-8 capitalize">
        {category} Wallpapers
      </h1>
      
      {loading && wallpapers.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          {!import.meta.env.VITE_UNSPLASH_ACCESS_KEY && (
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              To set up your Unsplash API key:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Create a .env file in the project root</li>
                <li>Add: VITE_UNSPLASH_ACCESS_KEY=your_api_key</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          )}
        </div>
      ) : (
        <>
          <WallpaperGrid wallpapers={wallpapers} showMetadata={true} />
          
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className={`px-6 py-3 rounded-lg text-white transition-colors ${
                  loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}