import { useQuery } from '@tanstack/react-query';
import { type ComponentProps, type ComponentRef, type RefAttributes, useState } from 'react';
import { Avatar, type AvatarProps } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Combobox } from '../../components/combobox';
import { Popover } from '../../components/popover';
import { cn } from '../../lib/utils';
import { readImage } from '../../utils/core';
import { PopoverScoped } from '../hotkey/components/PopoverScoped';
import { RecordTableInlineCell } from '../record-table/components/RecordTableCellInline';
import { EntityPicker } from './EntityPicker';
import { type Member, type MemberQueries, memberName, useMembersById } from './members';

/** A member's name, with an "Inactive" badge for disabled ones. */
const MemberLabel = ({ member }: { member: Member }) =>
  member.status === 'active' ? (
    <>{memberName(member)}</>
  ) : (
    <span className="inline-flex items-center gap-1">
      <span>{memberName(member)}</span>
      <Badge variant="destructive" size="sm" className="h-5 shrink-0">
        Inactive
      </Badge>
    </span>
  );

/** One member by id: avatar and name, or the placeholder when there is none. */
export const MemberInline = ({
  memberId,
  members,
  placeholder,
  size = 'lg',
  className,
}: {
  memberId: string | null | undefined;
  members: MemberQueries;
  placeholder?: string;
  size?: AvatarProps['size'];
  className?: string;
}) => {
  const member = useMembersById([memberId], members).get(memberId ?? '');

  return (
    <>
      {member && (
        <Avatar size={size}>
          <Avatar.Image src={readImage(member.avatarUrl)} />
          <Avatar.Fallback>{memberName(member).charAt(0)}</Avatar.Fallback>
        </Avatar>
      )}
      <Combobox.Value
        value={member && <MemberLabel member={member} />}
        loading={Boolean(memberId) && !member}
        placeholder={placeholder ?? 'Select a member'}
        className={className}
      />
    </>
  );
};

/** Active members, searched on their name and email; picking one reports its id. */
const MemberList = ({
  value,
  members,
  onPick,
}: {
  value: string | null | undefined;
  members: MemberQueries;
  onPick: (id: string | null) => void;
}) => {
  const team = useQuery(members.team);

  return (
    <EntityPicker
      items={team.data?.data ?? []}
      itemKey={(member) => ({ id: member.id, label: `${memberName(member)} ${member.email}` })}
      renderItem={(member) => (
        <MemberInline memberId={member.id} members={members} placeholder="Unnamed user" />
      )}
      value={value ? [value] : []}
      onValueChange={([id]) => onPick(id ?? null)}
      loading={team.isPending}
      error={team.error}
    />
  );
};

interface SelectMemberProps {
  value: string | null | undefined;
  onValueChange: (id: string | null) => void;
  /** Where the members come from: `memberQueries` from `@erxes/core-contract/client`. */
  members: MemberQueries;
  placeholder?: string;
}

/** The member as a record table cell; click to pick another. */
const SelectMemberInlineCell = ({
  ref,
  value,
  onValueChange,
  members,
  scope,
  placeholder,
  size = 'lg',
  className,
  variant,
  id,
  'aria-label': ariaLabel,
}: SelectMemberProps & {
  scope?: string;
  size?: AvatarProps['size'];
  className?: string;
  /** `field` beside its label in a side panel; a table cell by default. */
  variant?: ComponentProps<typeof RecordTableInlineCell.Trigger>['variant'];
  id?: string;
  /** Names the picker while it shows no member. */
  'aria-label'?: string;
} & RefAttributes<ComponentRef<typeof RecordTableInlineCell.Trigger>>) => {
  const [open, setOpen] = useState(false);

  return (
    <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
      <RecordTableInlineCell.Trigger
        ref={ref}
        id={id}
        aria-label={ariaLabel}
        variant={variant}
        className={className}
      >
        <span className="contents text-xs">
          <MemberInline
            memberId={value}
            members={members}
            placeholder={placeholder ?? ''}
            size={size}
          />
        </span>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <MemberList
          value={value}
          members={members}
          onPick={(next) => {
            onValueChange(next);
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/** A member picker button; its other props (an id, `Form.Control`'s aria wiring) go to the button. */
const SelectMemberField = ({
  value,
  onValueChange,
  members,
  placeholder,
  className,
  ...trigger
}: SelectMemberProps &
  Omit<ComponentProps<typeof Combobox.Trigger>, 'value' | 'children' | 'placeholder'>) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Combobox.Trigger {...trigger} className={cn('w-full', className)}>
        <MemberInline memberId={value} members={members} placeholder={placeholder} />
      </Combobox.Trigger>
      <Combobox.Content>
        <MemberList
          value={value}
          members={members}
          onPick={(next) => {
            onValueChange(next);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};

/** The member picker as a table cell and as a field. */
export const SelectMember = {
  InlineCell: SelectMemberInlineCell,
  Field: SelectMemberField,
};
