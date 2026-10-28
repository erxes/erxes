import { useCallback } from 'react';
import { TLatLng } from '../types/structureLocation';
import { useCurrentLocation } from './useCurrentLocation';
import { useLocationSearch } from './useLocationSearch';
import { useStructureLocation } from './useStructureLocation';

export const useStructureLocationField = (fallbackCenter: TLatLng | null) => {
  const { position, setPosition, radius, setRadius } = useStructureLocation();
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
