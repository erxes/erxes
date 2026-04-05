import { IconX } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useSuggestionPopoverComponent } from '../../hooks/useSuggestionPopoverComponent';

export const PlaceholderInputSuggestionCustomPopover = ({
  suggestionType,
  title,
  trigger,
  searchValue,
  onSelect,
  onClose,
  selectFieldName,
  internalRef,
  positionStyle,
}: {
  suggestionType: string;
  title: string;
  trigger?: string;
  searchValue: string;
  onSelect: (suggestion: string) => void;
  onClose: () => void;
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
      className="z-50 w-80 overflow-hidden rounded-lg border bg-background shadow-lg"
      style={positionStyle}
    >
      <div className="border-b bg-muted/30 px-3 py-2.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-sm font-medium text-foreground">
                {title}
              </div>
              {trigger ? (
                <span className="rounded border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {trigger}
                </span>
              ) : null}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Search and choose a value to insert.
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mr-1 -mt-1 size-7 shrink-0"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClose}
            aria-label="Close suggestions"
          >
            <IconX className="size-4" />
          </Button>
        </div>
      </div>
      <CustomSuggestionComponent
        searchValue={searchValue}
        onSelect={onSelect}
        selectField={selectFieldName}
      />
    </div>
  );
};
