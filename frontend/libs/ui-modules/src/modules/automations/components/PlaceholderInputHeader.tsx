import { Button, Popover, ToggleGroup } from 'erxes-ui';
import { SuggestionConfig, SuggestionType } from '../constants';

interface PlaceholderInputHeaderProps {
  inputMode: 'expression' | 'fixed';
  onInputModeChange: (mode: 'expression' | 'fixed') => void;
  enabledTypes: Record<SuggestionType, boolean>;
  suggestionConfigs: SuggestionConfig[];
  onlyExpression?: boolean;
  onlyFixed?: boolean;
  hideModeToggle?: boolean;
  hideInfoPopover?: boolean;
}

export function PlaceholderInputHeader({
  inputMode,
  onInputModeChange,
  enabledTypes,
  suggestionConfigs,
  onlyExpression = false,
  onlyFixed = false,
  hideModeToggle = false,
  hideInfoPopover = false,
}: PlaceholderInputHeaderProps) {
  // Filter suggestion configs based on enabled types
  const enabledConfigs = suggestionConfigs.filter(
    (config) => enabledTypes[config.type],
  );

  return (
    <div className="flex flex-row justify-between">
      {!hideModeToggle && (
        <ToggleGroup
          type="single"
          size="sm"
          className="max-w-32"
          value={inputMode}
          onValueChange={(value) =>
            onInputModeChange(value as 'expression' | 'fixed')
          }
          variant="outline"
        >
          {!onlyFixed && (
            <ToggleGroup.Item value="fixed">Fixed</ToggleGroup.Item>
          )}
          {!onlyExpression && (
            <ToggleGroup.Item value="expression">Expression</ToggleGroup.Item>
          )}
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
