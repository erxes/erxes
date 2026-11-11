import { Combobox, Command } from 'erxes-ui/components';
import { SexCodes } from 'erxes-ui/constants';
import { SexCode } from 'erxes-ui/types';

export const SexField = ({
  value,
  onValueChange,
}: {
  value: SexCode;
  onValueChange: (value: SexCode) => void;
}) => {
  return (
    <Command>
      <Command.Input />
      <Command.List>
        {Object.entries(SexCodes).map(([key, val]) => (
          <Command.Item
            key={key}
            value={val.label}
            onSelect={() => {
              onValueChange(Number(key) as SexCode);
            }}
          >
            {val.label}
            <Combobox.Check checked={value === Number(key)} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
