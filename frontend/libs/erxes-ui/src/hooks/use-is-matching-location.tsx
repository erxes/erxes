import { useCallback } from 'react';
import { matchPath, useLocation } from 'react-router-dom';

export const useIsMatchingLocation = (basePath?: string) => {
  const location = useLocation();

  return useCallback(
    (path: string) => {
      const constructedPath = basePath
        ? new URL(basePath + path, document.location.origin).pathname ?? ''
        : path;

      return !!matchPath(constructedPath, location.pathname);
    },
    [location.pathname, basePath],
  );
};
