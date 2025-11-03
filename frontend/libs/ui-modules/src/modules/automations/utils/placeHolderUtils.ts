import { DEFAULT_SUGGESTION_CONFIGS } from '../constants/placeholderInputConstants';
import {
  SuggestionConfig,
  SuggestionType,
} from '../types/placeholderInputTypes';

export function buildSuggestionMaps(extra: SuggestionConfig[] = []) {
  const suggestionConfigs = [...DEFAULT_SUGGESTION_CONFIGS, ...extra];
  const suggestionTriggerTypesMap = suggestionConfigs.reduce((acc, cfg) => {
    acc[cfg.trigger] = cfg.type as SuggestionType;
    return acc;
  }, {} as Record<string, SuggestionType>);

  const suggestionTypeToTitlesMap = suggestionConfigs.reduce((acc, cfg) => {
    acc[cfg.type as SuggestionType] = cfg.title;
    return acc;
  }, {} as Record<SuggestionType, string>);

  const suggestionTypeToFormatsMap = suggestionConfigs.reduce((acc, cfg) => {
    acc[cfg.type as SuggestionType] = cfg.formatSelection;
    return acc;
  }, {} as Record<SuggestionType, (value: string) => string>);

  const suggestionTypeToRenderersMap = suggestionConfigs.reduce((acc, cfg) => {
    acc[cfg.type as SuggestionType] = (cfg.renderer || 'command') as
      | 'command'
      | 'custom';
    return acc;
  }, {} as Record<SuggestionType, 'command' | 'custom'>);

  return {
    suggestionConfigs,
    suggestionTriggerTypesMap,
    suggestionTypeToTitlesMap,
    suggestionTypeToFormatsMap,
    suggestionTypeToRenderersMap,
  };
}
