import type { User } from '@erxes/core-contract';
import { IconUser } from '@tabler/icons-react';
import {
  Avatar,
  type AvatarProps,
  Badge,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  Tooltip,
  cn,
  readImage,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import { createContext, forwardRef, type ReactNode, useContext, useState } from 'react';
import { useMembers } from '~/components/inlineCells';
import { useSession } from '~/modules/auth/session';

/*
 * Old ui-modules SelectMember (team member picker) on core's users list:
 * the inline cell, form item and filter parts contacts use.
 */

const memberName = (member: User) => member.fullName || member.username || member.email;

interface ISelectMemberContext {
  memberIds: string[];
  onSelect: (member: User | null) => void;
}

const SelectMemberContext = createContext<ISelectMemberContext | null>(null);

const useSelectMemberContext = () => {
  const context = useContext(SelectMemberContext);

  if (!context) throw new Error('SelectMember parts must be inside SelectMember.Provider');

  return context;
};

/** Owns the selection and reports it as one id (single) or ids (multiple). */
const SelectMemberProvider = ({
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

/** A member's name, with the old "Inactive" badge for disabled ones. */
const MemberLabel = ({ member }: { member: User }) =>
  member.status === 'active' ? (
    <>{memberName(member)}</>
  ) : (
    <span className="inline-flex items-center gap-1">
      <span>{memberName(member)}</span>
      <Badge variant="destructive" className="h-5 shrink-0 px-1.5 text-[11px]">
        Inactive
      </Badge>
    </span>
  );

/** Selected members: avatars, then the name (old MembersInline). */
export const MembersInline = ({
  memberIds,
  placeholder,
  size = 'lg',
  className,
}: {
  memberIds: string[];
  placeholder?: string;
  size?: AvatarProps['size'];
  className?: string;
}) => {
  const members = useMembers();
  const { user } = useSession();
  const selected = memberIds.flatMap((id) => members.find((member) => member.id === id) ?? []);
  const loading = memberIds.length > 0 && members.length === 0;
  let value: string | JSX.Element | undefined;

  if (selected.length === 1) {
    value = <MemberLabel member={selected[0]} />;
  } else if (selected.length > 1) {
    value = selected.some((member) => member.id === user.id)
      ? `You and ${selected.length - 1} others`
      : `${selected.length} members`;
  }

  return (
    <Tooltip.Provider>
      {selected.length > 0 && (
        <div className={cn('flex', selected.length > 1 && '-space-x-1.5')}>
          {selected.slice(0, 3).map((member) => (
            <Tooltip delayDuration={100} key={member.id}>
              <Tooltip.Trigger asChild>
                <Avatar
                  className={cn('bg-background', selected.length > 1 && 'ring-2 ring-background')}
                  size={size}
                >
                  <Avatar.Image src={readImage(member.avatarUrl ?? undefined, 200)} />
                  <Avatar.Fallback>{memberName(member).charAt(0)}</Avatar.Fallback>
                </Avatar>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <MemberLabel member={member} />
              </Tooltip.Content>
            </Tooltip>
          ))}
        </div>
      )}
      <Combobox.Value
        value={value}
        loading={loading}
        placeholder={placeholder ?? 'Select members'}
        className={className}
      />
    </Tooltip.Provider>
  );
};

const SelectMemberValue = ({
  placeholder,
  size,
}: {
  placeholder?: string;
  size?: AvatarProps['size'];
}) => {
  const { memberIds } = useSelectMemberContext();

  return <MembersInline memberIds={memberIds} placeholder={placeholder} size={size} />;
};

/** Searchable members, the selected ones first (old SelectMemberContent). */
const SelectMemberContent = () => {
  const members = useMembers();
  const { memberIds, onSelect } = useSelectMemberContext();
  const [search, setSearch] = useState('');
  const term = search.trim().toLowerCase();

  const matches = members.filter(
    (member) =>
      !term ||
      memberName(member).toLowerCase().includes(term) ||
      member.email.toLowerCase().includes(term),
  );

  const ordered = [
    ...matches.filter((member) => memberIds.includes(member.id)),
    ...matches.filter((member) => !memberIds.includes(member.id)),
  ];

  const lastSelectedIndex = ordered.reduce(
    (last, member, index) => (memberIds.includes(member.id) ? index : last),
    -1,
  );

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
        <Combobox.Empty loading={members.length === 0 && !term} />
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

/** The member as a record table cell; click to pick another. */
const SelectMemberInlineCell = forwardRef<
  React.ComponentRef<typeof RecordTableInlineCell.Trigger>,
  {
    value?: string | null;
    onValueChange?: (value: string[] | string | null) => void;
    scope?: string;
    placeholder?: string;
    size?: AvatarProps['size'];
    className?: string;
    id?: string;
  }
>(({ value, onValueChange, scope, placeholder, size = 'lg', className, id }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectMemberProvider value={value} onValueChange={onValueChange} setOpen={setOpen}>
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger ref={ref} id={id} className={cn(className, 'text-xs')}>
          <SelectMemberValue placeholder={placeholder ?? ''} size={size} />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectMemberContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectMemberProvider>
  );
});

SelectMemberInlineCell.displayName = 'SelectMemberInlineCell';

/** A member picker as a form control. */
const SelectMemberFormItem = ({
  value,
  onValueChange,
  className,
  placeholder,
}: {
  value?: string | null;
  onValueChange?: (value: string | undefined) => void;
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectMemberProvider
      value={value}
      onValueChange={(next) => onValueChange?.(typeof next === 'string' ? next : undefined)}
      setOpen={setOpen}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectMemberValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectMemberContent />
        </Combobox.Content>
      </Popover>
    </SelectMemberProvider>
  );
};

/** Adds the member option to a filter menu. */
const SelectMemberFilterItem = ({
  value = 'ownerId',
  label = 'Owner',
}: {
  value?: string;
  label?: string;
}) => (
  <Filter.Item value={value}>
    <IconUser />
    {label}
  </Filter.Item>
);

/** The member list inside the filter popover. */
const SelectMemberFilterView = ({ queryKey = 'ownerId' }: { queryKey?: string }) => {
  const [ownerId, setOwnerId] = useQueryState<string>(queryKey);
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey}>
      <SelectMemberProvider
        value={ownerId}
        onValueChange={(next) => {
          setOwnerId(typeof next === 'string' ? next : null);
          resetFilterState();
        }}
      >
        <SelectMemberContent />
      </SelectMemberProvider>
    </Filter.View>
  );
};

/** The chosen member as a filter bar chip. */
const SelectMemberFilterBar = ({
  queryKey = 'ownerId',
  label = 'Owner',
}: {
  queryKey?: string;
  label?: string;
}) => {
  const [ownerId, setOwnerId] = useQueryState<string>(queryKey);
  const [open, setOpen] = useState(false);

  if (!ownerId) return null;

  return (
    <Filter.BarItem queryKey={queryKey}>
      <Filter.BarName>
        <IconUser />
        {label}
      </Filter.BarName>
      <SelectMemberProvider
        value={ownerId}
        onValueChange={(next) => {
          setOwnerId(typeof next === 'string' && next ? next : null);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey}>
              <SelectMemberValue />
            </Filter.BarButton>
          </Popover.Trigger>
          <Combobox.Content>
            <SelectMemberContent />
          </Combobox.Content>
        </Popover>
      </SelectMemberProvider>
    </Filter.BarItem>
  );
};

export const SelectMember = {
  Provider: SelectMemberProvider,
  Value: SelectMemberValue,
  Content: SelectMemberContent,
  InlineCell: SelectMemberInlineCell,
  FormItem: SelectMemberFormItem,
  FilterItem: SelectMemberFilterItem,
  FilterView: SelectMemberFilterView,
  FilterBar: SelectMemberFilterBar,
};
