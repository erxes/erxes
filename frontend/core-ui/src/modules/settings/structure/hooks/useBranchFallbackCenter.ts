import { useMemo } from 'react';
import { IBranchListItem } from '../types/branch';
import { TLatLng } from '../types/branchLocation';
import { isValidLatLng } from '../utils/parseCoordinates';
import { useBranchesList } from './useBranchesList';

// A branch without a location opens the map near the ones that have one
export const useBranchFallbackCenter = (): TLatLng | null => {
  const { branches } = useBranchesList();

  return useMemo(() => {
    for (const branch of branches as IBranchListItem[]) {
      const lat = Number(branch.coordinate?.latitude);
      const lng = Number(branch.coordinate?.longitude);

      if (
        branch.coordinate?.latitude &&
        branch.coordinate?.longitude &&
        isValidLatLng(lat, lng)
      ) {
        return { lat, lng };
      }
    }

    return null;
  }, [branches]);
};
