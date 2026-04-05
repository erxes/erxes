import { Command } from 'erxes-ui';

export const OptionsCommandList = ({
  selectOptions,
  onSelect,
}: {
  selectOptions: { label: string; value: string }[];
  onSelect: (value: string) => void;
}) => {
  if (!selectOptions?.length) {
    return <Command.Empty>No options available.</Command.Empty>;
  }

  return (
    <Command.Group value="options">
      {selectOptions.map((option) => (
        <Command.Item
          key={String(option.value)}
          value={String(option.value)}
          onSelect={onSelect}
        >
          <div className="flex min-w-0 items-center justify-between gap-3">
            <span className="truncate">{option.label || '-'}</span>
            <span className="truncate font-mono text-[11px] text-muted-foreground">
              {String(option.value)}
            </span>
          </div>
        </Command.Item>
      ))}
    </Command.Group>
  );
};
