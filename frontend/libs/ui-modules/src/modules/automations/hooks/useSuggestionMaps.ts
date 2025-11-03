import { useMemo } from 'react';
import { buildSuggestionMaps } from '../utils/placeHolderUtils';
import { SuggestionConfig } from '../types/placeholderInputTypes';

export function useSuggestionMaps(extraSuggestionConfigs: SuggestionConfig[]) {
  const maps = useMemo(
    () => buildSuggestionMaps(extraSuggestionConfigs),
    [extraSuggestionConfigs],
  );

  return maps;
}
