export interface Wallpaper {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  author: string;
  category: string;
  tags?: string[];
  resolutions: Resolution[];
  downloads: number;
  likes: number;
  createdAt: string;
  colors: string[];
  downloadLocation?: string;
}

export type Resolution = '1080p' | '2K' | '4K' | '8K';

export interface Category {
  id: string;
  name: string;
  imageUrl: string;
}