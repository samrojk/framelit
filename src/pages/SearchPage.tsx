import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { WallpaperGrid } from '../components/WallpaperGrid';
import { searchPhotos } from '../services/unsplash';
import { Wallpaper } from '../types';

export function SearchPage() {
  const { query } = useParams<{ query: string }>();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<Wallpaper[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;
    
    // Reset state when query changes
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    
    const fetchPhotos = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await searchPhotos(query, 1, 16); // Load 16 wallpapers initially
        
        // Create a Set to track IDs we've already seen to prevent duplicates
        const seenIds = new Set<string>();
        
        const wallpapers: Wallpaper[] = result.results
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
            category: 'Photography',
            tags: photo.tags?.map(tag => tag.title) || [],
            resolutions: ['1080p', '2K', '4K'],
            downloads: photo.downloads || 0,
            likes: photo.likes || 0,
            createdAt: photo.created_at,
            colors: photo.color ? [photo.color] : [],
            downloadLocation: photo.links.download_location,
          }));

        setPhotos(wallpapers);
        setHasMore(result.total_pages > 1);
      } catch (error) {
        console.error('Failed to fetch photos:', error);
        setError('Failed to load wallpapers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [query]);

  const loadMore = async () => {
    if (!query || loading) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await searchPhotos(query, nextPage, 16); // Load 16 more wallpapers
      
      // Create a Set of existing IDs to prevent duplicates
      const existingIds = new Set(photos.map(photo => photo.id));
      
      const wallpapers: Wallpaper[] = result.results
        .filter(photo => !existingIds.has(photo.id)) // Filter out duplicates
        .map(photo => ({
          id: photo.id,
          title: photo.description || photo.alt_description || 'Untitled',
          url: photo.urls.full,
          thumbnail: photo.urls.regular + '?w=800&q=80',
          author: photo.user.name,
          category: 'Photography',
          tags: photo.tags?.map(tag => tag.title) || [],
          resolutions: ['1080p', '2K', '4K'],
          downloads: photo.downloads || 0,
          likes: photo.likes || 0,
          createdAt: photo.created_at,
          colors: photo.color ? [photo.color] : [],
          downloadLocation: photo.links.download_location,
        }));

      if (wallpapers.length > 0) {
        setPhotos(prev => [...prev, ...wallpapers]);
        setPage(nextPage);
        setHasMore(result.total_pages > nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more photos:', error);
      setError('Failed to load more wallpapers');
    } finally {
      setLoading(false);
    }
  };

  if (!query) {
    return (
      <div className="pt-24 pb-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
          Please enter a search term
        </h2>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">
        Search Results for "{query}"
      </h1>
      
      {loading && photos.length === 0 ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : photos.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">
          No wallpapers found for "{query}"
        </p>
      ) : (
        <>
          <WallpaperGrid wallpapers={photos} showMetadata={true} />
          
          {hasMore && (
            <div className="mt-8 flex justify-center">
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