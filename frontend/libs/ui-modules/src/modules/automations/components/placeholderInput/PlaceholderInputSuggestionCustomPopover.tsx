import { useSuggestionPopoverComponent } from '../../hooks/useSuggestionPopoverComponent';

export const PlaceholderInputSuggestionCustomPopover = ({
  suggestionType,
  searchValue,
  onSelect,
  selectFieldName,
  internalRef,
  positionStyle,
}: {
  suggestionType: string;
  searchValue: string;
  onSelect: (suggestion: string) => void;
  selectFieldName: string;
  internalRef: React.RefObject<HTMLDivElement>;
  positionStyle?: React.CSSProperties;
}) => {
  const { CustomSuggestionComponent } = useSuggestionPopoverComponent({
    suggestionType,
    type: 'custom',
  });
  if (!CustomSuggestionComponent) return null;
  return (
    <div
      ref={internalRef}
      className="rounded-lg bg-background border max-h-80 shadow-lg z-50 w-80"
      style={positionStyle}
    >
      <CustomSuggestionComponent
        searchValue={searchValue}
        onSelect={onSelect}
        selectField={selectFieldName}
      />
    </div>
  );
};
