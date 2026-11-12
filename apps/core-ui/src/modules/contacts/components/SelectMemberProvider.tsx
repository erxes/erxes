import type { User } from '@erxes/core-contract';
import { useQuery } from '@tanstack/react-query';
import { type AvatarProps, Combobox, Command } from 'erxes-ui';
import { createContext, type ReactNode, useContext, useState } from 'react';
import { activeMembersQuery } from '~/lib/members';
import { MembersInline, memberLabelText } from './MembersInline';

/*
 * Old ui-modules SelectMember (team member picker) on core's users list:
 * the selection, its value and the searchable list every part shares.
 */

interface SelectMemberContextValue {
  memberIds: string[];
  onSelect: (member: User | null) => void;
}

const SelectMemberContext = createContext<SelectMemberContextValue | null>(null);

const useSelectMemberContext = () => {
  const context = useContext(SelectMemberContext);

  if (!context) throw new Error('SelectMember parts must be inside SelectMember.Provider');

  return context;
};

/** Owns the selection and reports it as one id (single) or ids (multiple). */
export const SelectMemberProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  setOpen,
}: {
  children: ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string | null;
  onValueChange?: (value: string[] | string | null) => void;
  setOpen?: (open: boolean) => void;
}) => {
  const memberIds = !value ? [] : Array.isArray(value) ? value : [value];

  const onSelect = (member: User | null) => {
    if (!member) {
      onValueChange?.(mode === 'single' ? null : []);
      setOpen?.(false);

      return;
    }

    if (mode === 'single') {
      setOpen?.(false);
      onValueChange?.(member.id);

      return;
    }

    onValueChange?.(
      memberIds.includes(member.id)
        ? memberIds.filter((id) => id !== member.id)
        : [...memberIds, member.id],
    );
  };

  return (
    <SelectMemberContext.Provider value={{ memberIds, onSelect }}>
      {children}
    </SelectMemberContext.Provider>
  );
};

export const SelectMemberValue = ({
  placeholder,
  size,
}: {
  placeholder?: string;
  size?: AvatarProps['size'];
}) => {
  const { memberIds } = useSelectMemberContext();

  return <MembersInline memberIds={memberIds} placeholder={placeholder} size={size} />;
};

/** Members matching the search, the selected ones first. */
const orderMembers = (members: User[], memberIds: string[], search: string) => {
  const term = search.trim().toLowerCase();
  const matches = members.filter(
    (member) =>
      !term ||
      memberLabelText(member).toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term),
  );

  return [
    ...matches.filter((member) => memberIds.includes(member.id)),
    ...matches.filter((member) => !memberIds.includes(member.id)),
  ];
};

/** Searchable active members, the selected ones first (old SelectMemberContent). */
export const SelectMemberContent = () => {
  const team = useQuery(activeMembersQuery());
  const { memberIds, onSelect } = useSelectMemberContext();
  const [search, setSearch] = useState('');
  const ordered = orderMembers(team.data?.data ?? [], memberIds, search);
  const lastSelectedIndex = ordered.findLastIndex((member) => memberIds.includes(member.id));

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        focusOnMount
      />
      <Command.List className="max-h-[300px] overflow-y-auto">
        <Combobox.Empty loading={team.isPending} error={team.error ?? undefined} />
        {ordered.map((member, index) => (
          <div key={member.id} className="contents">
            <Command.Item value={member.id} onSelect={() => onSelect(member)}>
              <MembersInline memberIds={[member.id]} placeholder="Unnamed user" />
              <Combobox.Check checked={memberIds.includes(member.id)} />
            </Command.Item>
            {index === lastSelectedIndex && index < ordered.length - 1 && (
              <Command.Separator className="my-1" />
            )}
          </div>
        ))}
      </Command.List>
    </Command>
  );
};
