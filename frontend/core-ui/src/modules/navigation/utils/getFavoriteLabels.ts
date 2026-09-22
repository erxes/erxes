interface FavoriteLabels {
  breadcrumb: string[];
  contextLabel: string;
  name: string;
  primaryLabel: string;
}

export function getFavoriteLabels(
  breadcrumb: string[] | undefined,
  fallback: string,
): FavoriteLabels {
  const resolvedBreadcrumb = breadcrumb?.length ? breadcrumb : [fallback];
  const [primaryLabel = fallback, ...contextLabels] = resolvedBreadcrumb;

  return {
    breadcrumb: resolvedBreadcrumb,
    contextLabel: contextLabels.join(' / '),
    name: resolvedBreadcrumb.join(' / '),
    primaryLabel,
  };
}
