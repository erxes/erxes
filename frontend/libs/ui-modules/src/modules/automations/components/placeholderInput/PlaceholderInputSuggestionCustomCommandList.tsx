import { useSuggestionPopoverComponent } from '../../hooks/useSuggestionPopoverComponent';

export const PlaceholderInputSuggestionCustomCommandList = ({
  searchValue,
  onSelect,
  selectField,
  suggestionType,
}: {
  suggestionType: string;
  searchValue: string;
  onSelect: (value: string) => void;
  selectField: string;
}) => {
  const { CustomSuggestionComponent } = useSuggestionPopoverComponent({
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
