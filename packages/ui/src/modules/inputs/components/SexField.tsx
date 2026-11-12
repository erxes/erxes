import { Combobox } from 'erxes-ui/components/combobox';
import { Command } from 'erxes-ui/components/command';
import { SexCodes } from 'erxes-ui/constants/SexCodes';
import { SexCode } from 'erxes-ui/types/SexCode';

const SEX_CODES = [SexCode.NOT_KNOWN, SexCode.MALE, SexCode.FEMALE, SexCode.NOT_APPLICABLE];

export const SexField = ({
  value,
  onValueChange,
}: {
  value: SexCode;
  onValueChange: (value: SexCode) => void;
}) => (
  <Command>
    <Command.Input />
    <Command.List>
      {SEX_CODES.map((code) => (
        <Command.Item key={code} value={SexCodes[code].label} onSelect={() => onValueChange(code)}>
          {SexCodes[code].label}
          <Combobox.Check checked={value === code} />
        </Command.Item>
      ))}
    </Command.List>
  </Command>
);
