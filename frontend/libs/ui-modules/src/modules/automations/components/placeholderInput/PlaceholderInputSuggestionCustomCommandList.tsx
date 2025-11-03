import { useCustomSuggestionPopover } from '../../hooks/useCustomSuggestionPopover';
import { SuggestionType } from '../../types/placeholderInputTypes';

export const PlaceholderInputSuggestionCustomCommandList = ({
  searchValue,
  onSelect,
  selectField,
  suggestionType,
}: {
  suggestionType: SuggestionType;
  searchValue: string;
  onSelect: (value: string) => void;
  selectField: string;
}) => {
  const { CustomSuggestionComponent } = useCustomSuggestionPopover({
    suggestionType,
    type: 'command',
  });
  if (!CustomSuggestionComponent) return null;
  return (
    <CustomSuggestionComponent
      searchValue={searchValue}
      onSelect={onSelect}
      selectField={selectField}
    />
  );
};
