import { FavoriteBreadcrumbSegment } from '../types';

export const createFavoriteBreadcrumb = (
  ...segments: FavoriteBreadcrumbSegment[]
) => {
  return segments
    .map((segment) => (typeof segment === 'string' ? segment.trim() : ''))
    .filter(Boolean)
    .slice(0, 3);
};
