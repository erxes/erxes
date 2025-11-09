import { DEFAULT_SUGGESTION_CONFIGS } from '../constants/placeholderInputConstants';
import {
  SuggestionConfig,
  SuggestionsOption,
} from '../types/placeholderInputTypes';

export function useSuggestionMaps(
  enabledTypes: Record<string, boolean>,
  extraSuggestionConfigs: SuggestionConfig[],
  suggestionsOptions?: Partial<Record<string, SuggestionsOption>>,
) {
  const allSuggestions = [
    ...DEFAULT_SUGGESTION_CONFIGS,
    ...extraSuggestionConfigs,
  ];

  const suggestions: SuggestionConfig[] = [];

  const suggestionTypeMap = new Map<string, SuggestionConfig>();
  const suggestionTypeByTriggerMap = new Map<string, SuggestionConfig>();

  for (let suggestion of allSuggestions) {
    const { type, trigger } = suggestion || {};
    if (!!enabledTypes[type]) {
      suggestions.push(suggestion);
      if (suggestionsOptions && suggestionsOptions[type]) {
        suggestion = {
          ...suggestion,
          options: { ...suggestion.options, ...suggestionsOptions[type] },
        };
      }

      suggestionTypeMap.set(type, suggestion);
      suggestionTypeByTriggerMap.set(trigger, suggestion);
    }
  }

  return {
    suggestions,
    suggestionTypeMap,
    suggestionTypeByTriggerMap,
  };
}
