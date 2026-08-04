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
          <Button variant="ghost" size="icon" aria-label="Show shortcuts">
            <IconHelpOctagon />
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-72">
          <div className="font-medium">Shortcuts</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Use these triggers to open a suggestion picker while typing.
          </div>
          <ul className="mt-3 space-y-2">
            {suggestions.map(({ type, title, trigger }) => (
              <li
                key={type}
                className="flex items-center justify-between rounded-md border px-2.5 py-2"
              >
                <span className="text-sm text-foreground">{title}</span>
                <span className="rounded border bg-background px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  {trigger}
                </span>
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
