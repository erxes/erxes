import { useCallback } from 'react';
import { useBranchFallbackCenter } from './useBranchFallbackCenter';
import { useBranchLocation } from './useBranchLocation';
import { useCurrentLocation } from './useCurrentLocation';
import { useLocationSearch } from './useLocationSearch';

export const useBranchLocationField = () => {
  const { position, setPosition, radius, setRadius } = useBranchLocation();
  const fallbackCenter = useBranchFallbackCenter();
  const search = useLocationSearch(setPosition);
  const currentLocation = useCurrentLocation(setPosition);
  const clear = useCallback(() => setPosition(null), [setPosition]);

  return {
    position,
    setPosition,
    radius,
    setRadius,
    fallbackCenter,
    search,
    currentLocation,
    clear,
  };
};

export type TLocationSearch = ReturnType<typeof useLocationSearch>;
export type TCurrentLocation = ReturnType<typeof useCurrentLocation>;
