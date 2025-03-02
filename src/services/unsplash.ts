import { createApi } from 'unsplash-js';
import { Wallpaper } from '../types';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

// Create a singleton instance of the Unsplash API client
export const unsplash = createApi({
  accessKey: UNSPLASH_ACCESS_KEY || '',
});

// Cache for search results to prevent duplicate API calls
const searchCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export async function searchPhotos(query: string, page = 1, perPage = 25) {
  if (!UNSPLASH_ACCESS_KEY) {
    return { results: [], total: 0, total_pages: 0 };
  }

  const cacheKey = `search:${query}:${page}:${perPage}`;
  const cached = searchCache[cacheKey];
  
  // Return cached results if they exist and haven't expired
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.data;
  }

  try {
    const result = await unsplash.search.getPhotos({
      query,
      page,
      perPage,
      orientation: 'landscape',
      orderBy: 'relevant',
    });

    if (result.errors) {
      console.error('Unsplash API errors:', result.errors);
      return { results: [], total: 0, total_pages: 0 };
    }

    // Cache the results
    searchCache[cacheKey] = {
      data: result.response,
      timestamp: Date.now(),
    };

    return result.response;
  } catch (error) {
    console.error('Search photos error:', error);
    return { results: [], total: 0, total_pages: 0 };
  }
}

// Cache for category photos
const categoryCache: Record<string, { data: Wallpaper[]; timestamp: number }> = {};

export async function getCategoryPhotos(category: string, page = 1): Promise<Wallpaper[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    return [];
  }

  const cacheKey = `category:${category}:${page}`;
  const cached = categoryCache[cacheKey];
  
  // Return cached results if they exist and haven't expired
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.data;
  }

  try {
    const result = await unsplash.photos.getRandom({
      query: category,
      count: 16, // Load 16 wallpapers per category
      orientation: 'landscape',
    });

    if (result.errors) {
      throw new Error('Failed to fetch photos');
    }

    const photos = Array.isArray(result.response) ? result.response : [result.response];
    
    // Create a Set to track IDs we've already seen to prevent duplicates
    const seenIds = new Set<string>();
    
    const wallpapers = photos
      .filter(photo => {
        // Only include photos with unique IDs
        if (seenIds.has(photo.id)) {
          return false;
        }
        seenIds.add(photo.id);
        return true;
      })
      .map((photo: any) => ({
        id: photo.id,
        title: photo.description || photo.alt_description || 'Untitled',
        url: photo.urls.full,
        thumbnail: photo.urls.regular + '?w=800&q=80',
        author: photo.user.name,
        category,
        tags: photo.tags?.map((tag: any) => tag.title) || [],
        resolutions: ['1080p', '2K', '4K'],
        downloads: photo.downloads || 0,
        likes: photo.likes || 0,
        createdAt: photo.created_at,
        colors: photo.color ? [photo.color] : [],
        downloadLocation: photo.links.download_location,
      }));

    // Cache the results
    categoryCache[cacheKey] = {
      data: wallpapers,
      timestamp: Date.now(),
    };

    return wallpapers;
  } catch (error) {
    console.error('Get category photos error:', error);
    return [];
  }
}

// Cache for random photos
const randomPhotoCache: Record<string, { url: string; timestamp: number }> = {};

export async function getRandomPhoto(category: string): Promise<string | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    return null;
  }

  const cacheKey = `random:${category}`;
  const cached = randomPhotoCache[cacheKey];
  
  // Return cached results if they exist and haven't expired
  if (cached && Date.now() - cached.timestamp < CACHE_EXPIRY) {
    return cached.url;
  }

  try {
    const result = await unsplash.photos.getRandom({
      query: category,
      orientation: 'landscape',
    });

    if (result.errors || !result.response) {
      throw new Error('Failed to fetch random image');
    }

    const photo = Array.isArray(result.response) ? result.response[0] : result.response;
    const url = photo.urls.regular + '?w=1920&q=80';
    
    // Cache the result
    randomPhotoCache[cacheKey] = {
      url,
      timestamp: Date.now(),
    };
    
    return url;
  } catch (error) {
    console.error('Failed to fetch random image:', error);
    return null;
  }
}