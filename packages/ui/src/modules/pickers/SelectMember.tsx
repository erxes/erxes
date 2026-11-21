import { IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { type ComponentProps, type ComponentRef, type RefAttributes, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, type AvatarProps } from '../../components/avatar';
import { Badge } from '../../components/badge';
import { Button } from '../../components/button';
import { Combobox } from '../../components/combobox';
import { Popover } from '../../components/popover';
import { cn } from '../../lib/utils';
import { readImage } from '../../utils/core';
import { PopoverScoped } from '../hotkey/components/PopoverScoped';
import { RecordTableInlineCell } from '../record-table/components/RecordTableCellInline';
import { MemberLink } from '../records/MemberLink';
import { EntityPicker } from './EntityPicker';
import { lazyFamily } from './lazyPickers';

/** 3.x's form and filter parts of the member picker; they load on first use. */
const memberFamily = lazyFamily(async () => (await import('./memberFamily')).memberFamily);

import {
  type Member,
  type MemberQueries,
  meFirst,
  memberName,
  useMeId,
  useMembersById,
} from './members';

/** A member's name, with an "Inactive" badge for disabled ones. */
const MemberLabel = ({ member }: { member: Member }) => {
  const { t } = useTranslation('ui', { keyPrefix: 'member' });

  return member.status === 'active' ? (
    <>{memberName(member)}</>
  ) : (
    <span className="inline-flex items-center gap-1">
      <span>{memberName(member)}</span>
      <Badge variant="destructive" size="sm" className="h-5 shrink-0">
        {t('inactive', 'Inactive')}
      </Badge>
    </span>
  );
};

/** A member's avatar and name by id, or a placeholder without one. */
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
  const { t } = useTranslation('ui', { keyPrefix: 'member' });
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
        placeholder={placeholder ?? t('select', 'Select a member')}
        className={className}
      />
    </>
  );
};

/** Active members, searched on their name and email; picking one reports its id. */
const MemberList = ({
  value,
  members,
  noneLabel,
  onPick,
}: Pick<SelectMemberProps, 'value' | 'members' | 'noneLabel'> & {
  onPick: (id: string | null) => void;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'member' });
  const team = useQuery(members.team);
  const meId = useMeId(members);

  return (
    <EntityPicker
      items={meFirst(team.data?.data ?? [], meId)}
      itemKey={(member) => ({
        id: member.id,
        label: `${memberName(member)} ${member.email ?? ''}`,
      })}
      renderItem={(member) => (
        <MemberInline
          memberId={member.id}
          members={members}
          placeholder={t('unnamed', 'Unnamed user')}
        />
      )}
      value={value ? [value] : []}
      onValueChange={([id]) => onPick(id ?? null)}
      noneLabel={noneLabel}
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
  /** A first row that picks no member, e.g. "Anyone" on a filter. */
  noneLabel?: string;
}

/** The member as a record table cell; click to pick another. */
const SelectMemberInlineCell = ({
  ref,
  value,
  onValueChange,
  members,
  noneLabel,
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
          noneLabel={noneLabel}
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
  noneLabel,
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
          noneLabel={noneLabel}
          onPick={(next) => {
            onValueChange(next);
            setOpen(false);
          }}
        />
      </Combobox.Content>
    </Popover>
  );
};

/**
 * A record panel's member row: the member as a chip that opens them in core's side panel, and a
 * button, shown on hover, to pick another; with none, "+ Add". Read-only without `onValueChange`.
 */
const SelectMemberLinked = ({
  value,
  onValueChange,
  members,
  noneLabel,
  scope,
  addLabel,
  changeLabel,
  emptyLabel,
}: Omit<SelectMemberProps, 'onValueChange' | 'placeholder'> & {
  onValueChange?: (id: string | null) => void;
  scope?: string;
  /** The button's words while no member is picked. */
  addLabel?: string;
  /** The hover button's name for screen readers once one is. */
  changeLabel?: string;
  /** Read-only and empty. */
  emptyLabel?: string;
}) => {
  const { t } = useTranslation('ui', { keyPrefix: 'member' });
  const [open, setOpen] = useState(false);
  const add = addLabel ?? t('add', 'Add');
  const change = changeLabel ?? t('change', 'Change');

  return (
    <div className="group/relations flex min-h-7 min-w-0 items-center gap-1 px-1">
      {value && (
        <div className="flex min-w-0 overflow-hidden">
          <MemberLink memberId={value} members={members} />
        </div>
      )}
      {!value && !onValueChange && (
        <span className="px-1 text-xs text-muted-foreground">
          {emptyLabel ?? t('none', 'Not specified')}
        </span>
      )}
      {onValueChange && (
        <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
          <Popover.Trigger
            render={
              <Button
                variant="ghost"
                size="xs"
                tone="muted"
                data-panel-inline=""
                aria-label={value ? change : add}
                className={cn(
                  'shrink-0 [&>svg]:size-3.5',
                  value &&
                    'opacity-0 group-hover/relations:opacity-100 focus-visible:opacity-100 data-popup-open:opacity-100',
                )}
              />
            }
          >
            <IconPlus aria-hidden="true" />
            {!value && <span className="font-normal">{add}</span>}
          </Popover.Trigger>
          <Combobox.Content>
            <MemberList
              value={value}
              members={members}
              noneLabel={noneLabel}
              onPick={(next) => {
                onValueChange(next);
                setOpen(false);
              }}
            />
          </Combobox.Content>
        </PopoverScoped>
      )}
    </div>
  );
};

/**
 * The member picker: a table cell, a field, or a row opening the member.
 * 3.x's `FormItem` and filter parts (`FilterItem`, `FilterView`, `FilterBar`) take `members`,
 * `value` and `onValueChange` with a `mode`, as the branch and product pickers do.
 */
export const SelectMember = {
  InlineCell: SelectMemberInlineCell,
  Field: SelectMemberField,
  Linked: SelectMemberLinked,
  FormItem: memberFamily.FormItem,
  FilterItem: memberFamily.FilterItem,
  FilterView: memberFamily.FilterView,
  FilterBar: memberFamily.FilterBar,
  Content: memberFamily.Content,
  Value: memberFamily.Value,
};
