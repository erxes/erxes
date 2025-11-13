import { Collapsible, Command } from 'erxes-ui';

export const OptionsCommandList = ({
  selectOptions,
  onSelect,
}: {
  selectOptions: { label: string; value: string }[];
  onSelect: (value: string) => void;
}) => {
  if (!selectOptions?.length) {
    return null;
  }

  return (
    <Command.Group value="options">
      {selectOptions.map((option) => (
        <Command.Item
          key={String(option.value)}
          value={String(option.value)}
          onSelect={onSelect}
        >
          {option.label || '-'}
        </Command.Item>
      ))}
    </Command.Group>
  );
};
