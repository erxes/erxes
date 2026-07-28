import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import { Button, Command, cn, Popover } from 'erxes-ui';
import {
  getOptionLabel,
  OPERATION_COMPLETION_MODE_OPTIONS,
} from '../../constants/operationAutomationConstants';

export const OperationCompletionModeInput = ({
  value,
  onChange,
}: {
  value?: string;
  onChange: (value: string) => void;
}) => {
  const currentValue = value || 'every';

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {getOptionLabel(OPERATION_COMPLETION_MODE_OPTIONS, currentValue)}
          <IconChevronDown className="size-4 opacity-50" />
        </Button>
      </Popover.Trigger>
      <Popover.Content className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <Command.List>
            {OPERATION_COMPLETION_MODE_OPTIONS.map((option) => (
              <Command.Item
                key={option.value}
                value={option.value}
                onSelect={() => onChange(option.value)}
              >
                {option.label}
                <IconCheck
                  className={cn(
                    'ml-auto size-4',
                    currentValue === option.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};
