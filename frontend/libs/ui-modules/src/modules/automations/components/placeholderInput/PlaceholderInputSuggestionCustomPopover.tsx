import { SuggestionType } from '../../types/placeholderInputTypes';
import { useCustomSuggestionPopover } from '../../hooks/useCustomSuggestionPopover';

export const PlaceholderInputSuggestionCustomPopover = ({
  suggestionType,
  searchQuery,
  onSelect,
  onClose,
  internalRef,
}: {
  suggestionType: SuggestionType;
  searchQuery: string;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
  internalRef: React.RefObject<HTMLDivElement>;
}) => {
  const { CustomSuggestionComponent } = useCustomSuggestionPopover({
    suggestionType,
    type: 'custom',
  });
  if (!CustomSuggestionComponent) return null;
  return (
    <div
      ref={internalRef}
      className="rounded-lg bg-background border max-h-80 shadow-lg mt-2 fixed z-50 w-80"
    >
      <CustomSuggestionComponent
        searchQuery={searchQuery}
        onSelect={onSelect}
        onClose={onClose}
      />
    </div>
  );
};
