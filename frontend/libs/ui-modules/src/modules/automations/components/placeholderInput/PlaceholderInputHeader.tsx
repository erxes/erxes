import { Button, Popover, ToggleGroup } from 'erxes-ui';
import { usePlaceholderInputContext } from '../../contexts/PlaceholderInputContext';
import { IconHelpOctagon } from '@tabler/icons-react';

function PlaceholderInputHeaderComponent() {
  const { inputVariant, onInputModeChange, suggestions } =
    usePlaceholderInputContext();

  return (
    <div className="flex flex-row justify-between">
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
      <Popover>
        <Popover.Trigger asChild>
          <Button variant="ghost" aria-label="Show shortcuts">
            <IconHelpOctagon />
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <div className="font-medium mb-2">Shortcuts</div>
          <ul className="space-y-1">
            {suggestions.map(({ type, title, trigger }) => (
              <li key={type} className="flex items-center justify-between">
                <span className="text-muted-foreground">{title}</span>
                <span className="font-mono text-xs">{trigger}</span>
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover>
    </div>
  );
}

PlaceholderInputHeaderComponent.displayName = 'PlaceholderInput.Header';

export const PlaceholderInputHeader = PlaceholderInputHeaderComponent;
