import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { Wallpaper } from '../types';
import { unsplash } from '../services/unsplash';

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  showMetadata?: boolean;
}

export function WallpaperGrid({ wallpapers, showMetadata = false }: WallpaperGridProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (wallpaper: Wallpaper) => {
    if (downloading) return;
    
    setDownloading(wallpaper.id);
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
      link.download = `${wallpaper.title || 'wallpaper'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download:', error);
    } finally {
      setDownloading(null);
    }
  };

  const handleWallpaperClick = (wallpaper: Wallpaper) => {
    window.open(`/wallpaper/${wallpaper.id}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {wallpapers.map((wallpaper) => (
        <div
          key={wallpaper.id}
          className="group relative overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
        >
          <img
            src={wallpaper.thumbnail}
            alt={wallpaper.title}
            className="w-full aspect-[16/10] object-cover cursor-pointer"
            onClick={() => handleWallpaperClick(wallpaper)}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between text-white">
                <div className="space-y-1 flex-1 min-w-0 mr-4">
                  <p className="font-medium truncate" title={wallpaper.title}>{wallpaper.title}</p>
                  <p className="text-sm text-gray-300 truncate" title={`by ${wallpaper.author}`}>by {wallpaper.author}</p>
                  {showMetadata && wallpaper.tags && wallpaper.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {wallpaper.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-0.5 bg-black/30 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  className={`shrink-0 p-2 rounded-lg ${
                    downloading === wallpaper.id
                      ? 'bg-gray-500'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } transition-colors`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownload(wallpaper);
                  }}
                  disabled={downloading === wallpaper.id}
                  aria-label="Download wallpaper"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}