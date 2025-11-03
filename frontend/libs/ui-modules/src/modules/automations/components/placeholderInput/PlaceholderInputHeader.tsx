import { Button, Popover, ToggleGroup } from 'erxes-ui';
import { usePlaceholderInputContext } from '../../contexts/PlaceholderInputContext';
import { SuggestionType } from '../../types/placeholderInputTypes';

interface PlaceholderInputHeaderProps {
  hideModeToggle?: boolean;
  hideInfoPopover?: boolean;
}

function PlaceholderInputHeaderComponent({
  hideModeToggle = false,
  hideInfoPopover = false,
}: PlaceholderInputHeaderProps) {
  const { inputVariant, onInputModeChange, enabledTypes, suggestionConfigs } =
    usePlaceholderInputContext();
  // Filter suggestion configs based on enabled types
  const enabledConfigs = suggestionConfigs.filter(
    (config) => enabledTypes[config.type as SuggestionType],
  );

  return (
    <div className="flex flex-row justify-between">
      {!hideModeToggle && (
        <ToggleGroup
          type="single"
          size="sm"
          className="max-w-32"
          value={inputVariant}
          onValueChange={(value) =>
            onInputModeChange?.(value as 'expression' | 'fixed')
          }
          variant="outline"
        >
          <ToggleGroup.Item value="fixed">Fixed</ToggleGroup.Item>
          <ToggleGroup.Item value="expression">Expression</ToggleGroup.Item>
        </ToggleGroup>
      )}
      {!hideInfoPopover && (
        <Popover>
          <Popover.Trigger asChild>
            <Button variant="ghost" aria-label="Show shortcuts">
              ?
            </Button>
          </Popover.Trigger>
          <Popover.Content>
            <div className="font-medium mb-2">Shortcuts</div>
            <ul className="space-y-1">
              {enabledConfigs.map((cfg) => (
                <li
                  key={cfg.type}
                  className="flex items-center justify-between"
                >
                  <span className="text-muted-foreground">{cfg.title}</span>
                  <span className="font-mono text-xs">{cfg.trigger}</span>
                </li>
              ))}
            </ul>
          </Popover.Content>
        </Popover>
      )}
    </div>
  );
}

PlaceholderInputHeaderComponent.displayName = 'PlaceholderInput.Header';

export const PlaceholderInputHeader = PlaceholderInputHeaderComponent;
