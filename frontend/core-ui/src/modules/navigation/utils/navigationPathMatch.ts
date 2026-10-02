type TNavigationLocation = { pathname: string; search: string };

export const getNavigationPathMatchScore = (
  navigationPath: string,
  location: TNavigationLocation,
) => {
  const [path, query = ''] = navigationPath.replace(/^\/+/, '').split('?');
  const pathname = `/${path}`;

  if (
    location.pathname !== pathname &&
    !location.pathname.startsWith(`${pathname}/`)
  ) {
    return -1;
  }

  const params = [...new URLSearchParams(query).entries()];
  const current = new URLSearchParams(location.search);

  if (params.some(([key, value]) => current.get(key) !== value)) {
    return -1;
  }

  return params.length * 1000 + pathname.length;
};

export const findActiveNavigationPath = (
  paths: string[],
  location: TNavigationLocation,
) => {
  let activePath: string | undefined;
  let bestScore = -1;

  for (const path of paths) {
    const score = getNavigationPathMatchScore(path, location);

    if (score > bestScore) {
      bestScore = score;
      activePath = path;
    }
  }

  return activePath;
};
