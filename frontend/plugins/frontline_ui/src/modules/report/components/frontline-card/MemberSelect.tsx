import { SelectMember } from 'ui-modules';
import { Combobox, Popover } from 'erxes-ui';
import { MemberFormContent } from './MemberFormContent';
export const MemberSelect = ({
  channelIds,
  value = [],
  onValueChange,
  exclude = true,
  mode = 'multiple',
}: {
  channelIds: string[];
  value?: string[];
  onValueChange?: (value: string[]) => void;
  exclude?: boolean;
  mode?: 'single' | 'multiple';
}) => {
  return (
    <SelectMember.Provider
      value={value}
      mode={mode}
      onValueChange={(val) => onValueChange?.(val as string[])}
    >
      <Popover>
        <Combobox.Trigger>
          <SelectMember.Value />
        </Combobox.Trigger>

        <Combobox.Content>
          <MemberFormContent channelIds={channelIds} exclude={exclude} />
        </Combobox.Content>
      </Popover>
    </SelectMember.Provider>
  );
};
