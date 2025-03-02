import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft } from 'lucide-react';
import { Wallpaper } from '../types';
import { unsplash } from '../services/unsplash';

export function WallpaperPage() {
  const { id } = useParams<{ id: string }>();
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWallpaper() {
      if (!id) return;

      setLoading(true);
      setError(null);
      
      try {
        const result = await unsplash.photos.get({ photoId: id });
        if (result.errors) throw new Error('Failed to fetch wallpaper');

        const photo = result.response;
        setWallpaper({
          id: photo.id,
          title: photo.description || photo.alt_description || 'Untitled',
          url: photo.urls.full,
          thumbnail: photo.urls.regular,
          author: photo.user.name,
          category: 'Photography',
          tags: photo.tags?.map(tag => tag.title) || [],
          resolutions: ['1080p', '2K', '4K'],
          downloads: photo.downloads || 0,
          likes: photo.likes || 0,
          createdAt: photo.created_at,
          colors: photo.color ? [photo.color] : [],
          downloadLocation: photo.links.download_location,
        });
      } catch (error) {
        console.error('Failed to fetch wallpaper:', error);
        setError('Failed to load wallpaper. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchWallpaper();
  }, [id]);

  const handleDownload = async () => {
    if (!wallpaper || downloading) return;

    setDownloading(true);
    try {
      if (wallpaper.downloadLocation) {
        await unsplash.photos.trackDownload({
          downloadLocation: wallpaper.downloadLocation,
        });
      }

      const response = await fetch(wallpaper.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${wallpaper.title}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download:', error);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !wallpaper) {
    return (
      <div className="pt-24 text-center">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
          {error || 'Wallpaper not found'}
        </h2>
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-16">
      <div className="fixed inset-0 bg-black/90 z-0" />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-7xl w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-2xl">
          <div className="relative">
            <Link 
              to="/"
              className="absolute top-4 left-4 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <img
              src={wallpaper.url}
              alt={wallpaper.title}
              className="w-full max-h-[80vh] object-contain bg-black"
            />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{wallpaper.title}</h1>
                <p className="text-gray-600 dark:text-gray-400">by {wallpaper.author}</p>
                {wallpaper.tags && wallpaper.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {wallpaper.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className={`flex items-center space-x-2 px-6 py-3 ${
                  downloading
                    ? 'bg-gray-500'
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white rounded-lg transition-colors`}
              >
                <Download className="w-5 h-5" />
                <span>{downloading ? 'Downloading...' : 'Download'}</span>
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {wallpaper.resolutions.map(resolution => (
                <span
                  key={resolution}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                >
                  {resolution}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}