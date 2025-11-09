import { useMemo } from 'react';
import {
  DEFAULT_ENABLED_SUGGESTIONS,
  SUGGESTION_GROUPS,
} from '../constants/placeholderInputConstants';
import {
  EnabledSuggestions,
  SuggestionConfig,
} from '../types/placeholderInputTypes';

interface UsePlaceholderEnabledTypesParams {
  enabled?: EnabledSuggestions;
  suggestionGroups?: string[];
  enableAll?: boolean;
  extraSuggestionConfigs?: SuggestionConfig[];
}

export function usePlaceholderEnabledTypes({
  enabled,
  suggestionGroups,
  enableAll = false,
  extraSuggestionConfigs,
}: UsePlaceholderEnabledTypesParams) {
  const { enabledTypes } = useMemo(() => {
    const base: Record<string, boolean> = {
      ...DEFAULT_ENABLED_SUGGESTIONS,
    };

    if (enableAll) {
      Object.keys(base).forEach((key) => {
        base[key] = true;
      });
    } else if (suggestionGroups && suggestionGroups.length) {
      suggestionGroups.forEach((groupName) => {
        const types = SUGGESTION_GROUPS[groupName];
        if (types && types.length) {
          types.forEach((t) => {
            base[t] = true;
          });
        }
      });
    } else if (enabled) {
      for (const type of Object.keys(base)) {
        const enabledValue = enabled[type];
        base[type] = !!enabledValue;
      }
    }

    if (extraSuggestionConfigs?.length) {
      for (const { type: extraSuggestionType } of extraSuggestionConfigs) {
        base[extraSuggestionType] = true;
      }
    }

    return {
      enabledTypes: base,
    };
  }, [enabled, suggestionGroups, enableAll, extraSuggestionConfigs]);

  return { enabledTypes };
}
