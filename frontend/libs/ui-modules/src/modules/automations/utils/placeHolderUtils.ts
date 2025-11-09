import { DEFAULT_SUGGESTION_CONFIGS } from '../constants/placeholderInputConstants';
import { SuggestionConfig } from '../types/placeholderInputTypes';

export function buildSuggestionMaps(extra: SuggestionConfig[] = []) {
  const suggestionConfigs = [...DEFAULT_SUGGESTION_CONFIGS, ...extra];

  const suggestionTypeMap = new Map<string, SuggestionConfig>();
  const suggestionTypeByTriggerMap = new Map<string, SuggestionConfig>();

  for (const suggestionConfig of suggestionConfigs) {
    suggestionTypeMap.set(suggestionConfig.type, suggestionConfig);
    suggestionTypeByTriggerMap.set(suggestionConfig.trigger, suggestionConfig);
  }

  return {
    suggestionConfigs,
    suggestionTypeMap,
    suggestionTypeByTriggerMap,
  };
}
