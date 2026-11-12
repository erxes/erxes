import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { SexCodes } from 'erxes-ui/constants/SexCodes';
import type { SexCode } from 'erxes-ui/types/SexCode';

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
              onValueChange(Number(key));
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
