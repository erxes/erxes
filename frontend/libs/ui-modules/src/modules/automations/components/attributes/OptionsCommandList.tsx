import { Collapsible, Command } from 'erxes-ui';

export const OptionsCommandList = ({
  selectOptions,
}: {
  selectOptions: any[];
}) => {
  if (!selectOptions?.length) {
    return null;
  }

  return (
    <Collapsible className="space-y-2">
      <Collapsible.TriggerButton className="px-4">
        <div className="flex items-center gap-2">
          <span>Options</span>
          <Collapsible.TriggerIcon className="h-4 w-4" />
        </div>
      </Collapsible.TriggerButton>
      <Collapsible.Content className="px-4 m-0">
        <Command.Empty>Not found.</Command.Empty>
        <Command.Group value="options">
          {selectOptions.map((option: any) => (
            <Command.Item
              key={String(option.value)}
              value={String(option.value)}
            >
              {option.label || '-'}
            </Command.Item>
          ))}
        </Command.Group>
      </Collapsible.Content>
    </Collapsible>
  );
};
