import { IFavoritesDocument } from '@/organization/settings/db/definitions/favorites';

function titleize(value: string) {
  return value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeFavoritePath(path: string) {
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
}

export function normalizeFavoriteBreadcrumb(breadcrumb?: string[]) {
  return (breadcrumb || [])
    .map((segment) => segment.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function normalizeFavoriteIcon(icon?: string) {
  const normalizedIcon = icon?.trim();

  return normalizedIcon || undefined;
}

function getFallbackFavoriteBreadcrumb(path: string) {
  const segments = path.split(/[?#]/)[0].split('/');
  const breadcrumb = segments.filter(Boolean).slice(0, 3).map(titleize);

  return breadcrumb.length ? breadcrumb : ['Unknown'];
}

export function resolveFavoritesBreadcrumbs({
  favorites,
}: {
  favorites: IFavoritesDocument[];
}) {
  return favorites.map((favorite) => {
    const path = normalizeFavoritePath(favorite.path);
    const breadcrumb = normalizeFavoriteBreadcrumb(favorite.breadcrumb);

    return {
      ...favorite.toObject(),
      path,
      breadcrumb: breadcrumb.length
        ? breadcrumb
        : getFallbackFavoriteBreadcrumb(path),
    };
  });
}
