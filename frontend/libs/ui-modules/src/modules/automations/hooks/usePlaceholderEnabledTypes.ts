import { useMemo } from 'react';
import {
  DEFAULT_ENABLED_SUGGESTIONS,
  SUGGESTION_GROUPS,
} from '../constants/placeholderInputConstants';
import {
  EnabledSuggestionObject,
  EnabledSuggestions,
  EnabledSuggestionValue,
  SuggestionType,
} from '../types/placeholderInputTypes';

interface UsePlaceholderEnabledTypesParams {
  enabled?: EnabledSuggestions | Record<SuggestionType, boolean>;
  suggestionGroups?: string[];
  enableAll?: boolean;
  customRenderers?: Partial<Record<SuggestionType, React.ComponentType<any>>>;
}

const DEFAULT_ENABLED_SUGGESTIONS_VALUE = {
  attribute: undefined,
  emoji: undefined,
  date: undefined,
  option: undefined,
  call_user: undefined,
  call_tag: undefined,
  call_product: undefined,
  call_company: undefined,
  call_customer: undefined,
};

function isEnabledConfigObject(
  value: EnabledSuggestionValue | undefined,
): value is {
  enabled: boolean;
  selectFieldName: string;
  formatSelection?: (value: string) => string;
} {
  return typeof value === 'object' && value !== null && 'enabled' in value;
}

export function usePlaceholderEnabledTypes({
  enabled,
  suggestionGroups,
  enableAll = false,
  customRenderers,
}: UsePlaceholderEnabledTypesParams) {
  const { enabledTypes, enabledSuggestionsConfigMap } = useMemo(() => {
    const base: Record<SuggestionType, boolean> = {
      attribute: !!DEFAULT_ENABLED_SUGGESTIONS.attribute,
      emoji: !!DEFAULT_ENABLED_SUGGESTIONS.emoji,
      date: !!DEFAULT_ENABLED_SUGGESTIONS.date,
      option: !!DEFAULT_ENABLED_SUGGESTIONS.option,
      call_user: !!DEFAULT_ENABLED_SUGGESTIONS.call_user,
      call_tag: !!DEFAULT_ENABLED_SUGGESTIONS.call_tag,
      call_product: !!DEFAULT_ENABLED_SUGGESTIONS.call_product,
      call_company: !!DEFAULT_ENABLED_SUGGESTIONS.call_company,
      call_customer: !!DEFAULT_ENABLED_SUGGESTIONS.call_customer,
      ...(customRenderers
        ? Object.keys(customRenderers).reduce((acc, key) => {
            acc[key as SuggestionType] = true;
            return acc;
          }, {} as Record<SuggestionType, boolean>)
        : {}),
    };

    // const selectFieldNames: Record<SuggestionType, string | undefined> = {};

    // const formatSelections: Record<
    //   SuggestionType,
    //   ((value: string) => string) | undefined
    // > = {
    // };

    const enabledSuggestionsConfigMap: Record<string, EnabledSuggestionObject> =
      {};

    if (enableAll) {
      Object.keys(base).forEach((key) => {
        base[key as SuggestionType] = true;
      });
    }

    if (suggestionGroups && suggestionGroups.length) {
      suggestionGroups.forEach((groupName) => {
        const types = SUGGESTION_GROUPS[groupName];
        if (types && types.length) {
          types.forEach((t) => {
            base[t] = true;
          });
        }
      });
    }

    if (enabled) {
      for (const type of Object.keys(base) as SuggestionType[]) {
        const enabledValue = enabled[type];
        if (isEnabledConfigObject(enabledValue)) {
          base[type] = enabledValue.enabled;
          enabledSuggestionsConfigMap[type] = enabledValue;
        } else {
          base[type] = !!enabledValue;
        }
      }
    }

    return {
      enabledTypes: base,
      enabledSuggestionsConfigMap,
    };
  }, [enabled, suggestionGroups, enableAll, customRenderers]);

  return { enabledTypes, enabledSuggestionsConfigMap };
}
