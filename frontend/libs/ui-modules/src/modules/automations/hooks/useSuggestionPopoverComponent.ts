import { usePlaceholderInputContext } from '../contexts/PlaceholderInputContext';

export const useSuggestionPopoverComponent = ({
  suggestionType,
  type,
}: {
  suggestionType: string;
  type: 'custom' | 'command';
}) => {
  const { suggestionTypeMap } = usePlaceholderInputContext();

  const { mode, render } = suggestionTypeMap.get(suggestionType) || {};

  const isCustomRenderer = mode === type;
  const CustomSuggestionComponent = isCustomRenderer ? render : null;

  return {
    CustomSuggestionComponent,
  };
};
