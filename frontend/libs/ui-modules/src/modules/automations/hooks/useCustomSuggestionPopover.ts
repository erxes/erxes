import { usePlaceholderInputContext } from '../contexts/PlaceholderInputContext';
import { SuggestionType } from '../types/placeholderInputTypes';

export const useCustomSuggestionPopover = ({
  suggestionType,
  type,
}: {
  suggestionType: SuggestionType;
  type: 'custom' | 'command';
}) => {
  const { suggestionTypeToRenderersMap, customRenderers } =
    usePlaceholderInputContext();

  const isCustomRenderer =
    suggestionTypeToRenderersMap[suggestionType] === type;
  const CustomSuggestionComponent = isCustomRenderer
    ? customRenderers?.[suggestionType]
    : null;

  return {
    CustomSuggestionComponent,
  };
};
