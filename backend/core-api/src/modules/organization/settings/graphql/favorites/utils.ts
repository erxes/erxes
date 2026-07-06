import { IFavoritesDocument } from '@/organization/settings/db/definitions/favorites';

type FavoriteWithBreadcrumb = Omit<
  IFavoritesDocument,
  'breadcrumb' | 'toObject'
> & {
  breadcrumb?: string[];
  toObject?: () => Record<string, unknown>;
};

type ResolvedFavorite = Record<string, unknown> & {
  breadcrumb: string[];
  path: string;
};

const titleize = (value: string) => {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export const normalizeFavoritePath = (path: string) => {
  const trimmedPath = path.trim();

  if (!trimmedPath) {
    return '/';
  }

  try {
    const url = new URL(trimmedPath);
    return `${url.pathname}${url.search}`.replace(/\/$/, '') || '/';
  } catch {
    return trimmedPath.replace(/\/$/, '') || '/';
  }
};

export const normalizeFavoriteBreadcrumb = (breadcrumb?: string[]) => {
  return (breadcrumb || [])
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, 3);
};

export const normalizeFavoriteIcon = (icon?: string) => {
  const normalizedIcon = icon?.trim();

  return normalizedIcon || undefined;
};

const getFallbackFavoriteBreadcrumb = (path: string) => {
  const segments = normalizeFavoritePath(path).split(/[?#]/)[0].split('/');
  const breadcrumb = segments.filter(Boolean).slice(0, 3).map(titleize);

  return breadcrumb.length ? breadcrumb : ['Unknown'];
};

export const getFavoriteBreadcrumb = (favorite: {
  path: string;
  breadcrumb?: string[];
}) => {
  const breadcrumb = normalizeFavoriteBreadcrumb(favorite.breadcrumb);

  return breadcrumb.length
    ? breadcrumb
    : getFallbackFavoriteBreadcrumb(favorite.path);
};

const toFavoriteObject = (favorite: FavoriteWithBreadcrumb) => {
  if (typeof favorite.toObject === 'function') {
    return favorite.toObject();
  }

  return favorite;
};

export const resolveFavoritesBreadcrumbs = ({
  favorites,
}: {
  favorites: FavoriteWithBreadcrumb[];
}): ResolvedFavorite[] => {
  return favorites.map((favorite) => {
    const favoriteObject = toFavoriteObject(favorite);
    const path = normalizeFavoritePath(favorite.path);

    return {
      ...favoriteObject,
      path,
      breadcrumb: getFavoriteBreadcrumb({
        path,
        breadcrumb: favorite.breadcrumb,
      }),
    };
  });
};
