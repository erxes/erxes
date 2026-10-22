import { memberOptions } from '../utils/memberOptions';
import { useSubscription } from '@apollo/client';
import { IconPlus, IconUser } from '@tabler/icons-react';
import {
  AvatarProps,
  Button,
  Combobox,
  Command,
  Filter,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  cn,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules/states';
import { useUsers } from 'ui-modules/modules';
import { useDebounce } from 'use-debounce';
import {
  SelectMemberContext,
  useSelectMemberContext,
} from '../contexts/SelectMemberContext';
import { USER_STATUS_CHANGED } from '../graphql/subscriptions/userStatusChanged';
import { IUser } from '../types/TeamMembers';
import { MembersInline } from './MembersInline';

const SelectMemberProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  members,
  setOpen,
  allowUnassigned,
  disabled = false,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange?: (value: string[] | string | null) => void;
  members?: IUser[];
  setOpen?: (open: boolean) => void;
  allowUnassigned?: boolean;
  disabled?: boolean;
}) => {
  const [_members, setMembers] = useState<IUser[]>(members || []);
  const isSingleMode = mode === 'single';

  const onSelect = (member: IUser | null) => {
    if (disabled) return;
    if (!member) {
      setMembers([]);
      onValueChange?.(mode === 'single' ? null : []);
      setOpen?.(false);
      return;
    }
    if (isSingleMode) {
      setMembers([member]);
      setOpen?.(false);
      return onValueChange?.(member._id);
    }
    const arrayValue = Array.isArray(value) ? value : [];

    const isMemberSelected = arrayValue.includes(member._id);
    const newSelectedMemberIds = isMemberSelected
      ? arrayValue.filter((id) => id !== member._id)
      : [...arrayValue, member._id];

    setMembers((prev) => {
      const uniqueMembers = [...prev, member].filter(
        (m, index, self) => index === self.findIndex((t) => t._id === m._id),
      );
      return uniqueMembers.filter((m) => newSelectedMemberIds.includes(m._id));
    });
    onValueChange?.(newSelectedMemberIds);
  };

  const memberIds = !value ? [] : Array.isArray(value) ? value : [value];
  const loading = memberIds.some((id) => !_members.find((m) => m._id === id));

  return (
    <SelectMemberContext.Provider
      value={{
        memberIds,
        onSelect,
        members: _members,
        setMembers,
        loading,
        allowUnassigned: allowUnassigned || false,
        disabled,
      }}
    >
      {children}
    </SelectMemberContext.Provider>
  );
};

const SelectMemberValue = ({
  placeholder,
  size,
  showInactive,
}: {
  placeholder?: string;
  size?: AvatarProps['size'];
  showInactive?: boolean;
}) => {
  const { memberIds, members, setMembers, allowUnassigned } =
    useSelectMemberContext();

  return (
    <MembersInline
      memberIds={memberIds}
      members={members}
      updateMembers={setMembers}
      placeholder={placeholder}
      size={size}
      allowUnassigned={allowUnassigned}
      showInactive={showInactive}
    />
  );
};

const SelectMemberCommandItem = ({
  user,
  inactive = user.isActive === false,
}: {
  user: IUser;
  inactive?: boolean;
}) => {
  const { onSelect, memberIds, disabled } = useSelectMemberContext();

  return (
    <Command.Item
      value={user._id}
      disabled={disabled || (inactive && !memberIds.includes(user._id))}
      onSelect={() => {
        onSelect(user);
      }}
    >
      <MembersInline
        members={[
          {
            ...user,
            isActive: inactive ? false : user.isActive,
          },
        ]}
        placeholder="Unnamed user"
        showInactive
      />
      <Combobox.Check checked={memberIds.includes(user._id)} />
    </Command.Item>
  );
};

const SelectMemberNoAssigneeItem = () => {
  const { onSelect, memberIds, disabled } = useSelectMemberContext();
  const isNoAssigneeSelected =
    memberIds.length === 0 ||
    (memberIds.length === 1 && memberIds[0] === 'no-assignee');
  return (
    <Command.Item
      disabled={disabled}
      value="no-assignee"
      onSelect={() => onSelect(null)}
    >
      <MembersInline
        memberIds={[]}
        placeholder="Unnamed user"
        allowUnassigned
      />
      <Combobox.Check checked={isNoAssigneeSelected} />
    </Command.Item>
  );
};

const SelectMemberContent = () => {
  const currentUser = useAtomValue(currentUserState);
  const [search, setSearch] = useState('');
  const [inactiveMemberIds, setInactiveMemberIds] = useState<string[]>([]);
  const [debouncedSearch] = useDebounce(search, 500);
  const { memberIds, members, allowUnassigned } = useSelectMemberContext();
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
    },
  });
  useSubscription<{ userStatusChanged?: IUser }>(USER_STATUS_CHANGED, {
    onData: ({ data }) => {
      const statusChangedUser = data.data?.userStatusChanged;

      if (!statusChangedUser) return;

      setInactiveMemberIds((currentIds) =>
        statusChangedUser.isActive === false
          ? [...new Set([...currentIds, statusChangedUser._id])]
          : currentIds.filter((id) => id !== statusChangedUser._id),
      );
    },
  });

  const selectedMembers = members.filter((member) =>
    memberIds.includes(member._id),
  );
  const filteredMembers = memberOptions(
    currentUser,
    selectedMembers,
    users,
    inactiveMemberIds,
    search,
  );
  const lastSelectedIndex = filteredMembers.reduce(
    (lastIndex, member, index) =>
      memberIds.includes(member._id) ? index : lastIndex,
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
        <Combobox.Empty loading={loading} error={error} />
        {filteredMembers.map((member, index) => (
          <React.Fragment key={member._id}>
            <SelectMemberCommandItem
              user={member}
              inactive={
                member.isActive === false ||
                inactiveMemberIds.includes(member._id)
              }
            />
            {index === lastSelectedIndex &&
              index < filteredMembers.length - 1 && (
                <Command.Separator className="my-1" />
              )}
          </React.Fragment>
        ))}
        {!loading && allowUnassigned && <SelectMemberNoAssigneeItem />}

        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={users.length}
          totalCount={totalCount}
        />
      </Command.List>
    </Command>
  );
};

export const SelectMemberFilterItem = ({
  value,
  label,
}: {
  value?: string;
  label?: string;
}) => {
  return (
    <Filter.Item value={value || 'assignedTo'}>
      <IconUser />
      {label || 'Assigned To'}
    </Filter.Item>
  );
};

export const SelectMemberFilterView = ({
  onValueChange,
  queryKey,
  mode = 'single',
}: {
  onValueChange?: (value: string[] | string | null) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
}) => {
  const [assignedTo, setAssignedTo] = useQueryState<string[] | string>(
    queryKey || 'assignedTo',
  );
  const { resetFilterState } = useFilterContext();

  return (
    <Filter.View filterKey={queryKey || 'assignedTo'}>
      <SelectMemberProvider
        mode={mode}
        value={assignedTo || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setAssignedTo(value as string[] | string);
          resetFilterState();
          onValueChange?.(value);
        }}
      >
        <SelectMemberContent />
      </SelectMemberProvider>
    </Filter.View>
  );
};

export const SelectMemberFilterBar = ({
  iconOnly,
  onValueChange,
  queryKey,
  mode = 'single',
  label,
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string | null) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
  label?: string;
}) => {
  const [assignedTo, setAssignedTo] = useQueryState<string[] | string>(
    queryKey || 'assignedTo',
  );
  const [open, setOpen] = useState(false);

  if (!assignedTo) {
    return null;
  }

  return (
    <Filter.BarItem queryKey={queryKey || 'assignedTo'}>
      <Filter.BarName>
        <IconUser />
        {label ? label : !iconOnly && 'Assigned To'}
      </Filter.BarName>
      <SelectMemberProvider
        mode={mode}
        value={assignedTo || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          if (value && value.length > 0) {
            setAssignedTo(value as string[] | string);
          } else {
            setAssignedTo(null);
          }
          onValueChange?.(value);
          setOpen(false);
        }}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Filter.BarButton filterKey={queryKey || 'assignedTo'}>
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

export const SelectMemberInlineCell = React.forwardRef<
  React.ComponentRef<typeof RecordTableInlineCell.Trigger>,
  Omit<React.ComponentProps<typeof SelectMemberProvider>, 'children'> &
    React.ComponentProps<typeof RecordTableInlineCell.Trigger> & {
      scope?: string;
      placeholder?: string;
      size?: AvatarProps['size'];
    }
>(
  (
    {
      mode,
      value,
      onValueChange,
      members,
      size = 'lg',
      scope,
      placeholder,
      className,
      ...props
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    return (
      <SelectMemberProvider
        mode={mode}
        value={value}
        onValueChange={onValueChange}
        members={members}
        setOpen={setOpen}
      >
        <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
          <RecordTableInlineCell.Trigger
            ref={ref}
            {...props}
            className={cn(className, 'text-xs')}
          >
            <SelectMemberValue placeholder={placeholder ?? ''} size={size} />
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <SelectMemberContent />
          </RecordTableInlineCell.Content>
        </PopoverScoped>
      </SelectMemberProvider>
    );
  },
);

SelectMemberInlineCell.displayName = 'SelectMemberInlineCell';

export const SelectMemberFormItem = ({
  onValueChange,
  className,
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof SelectMemberProvider>, 'children'> & {
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectMemberProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
      }}
      {...props}
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

export const SelectMemberDetail = ({
  onValueChange,
  className,
  size = 'xl',
  placeholder,
  value,
  ...props
}: Omit<React.ComponentProps<typeof SelectMemberProvider>, 'children'> & {
  className?: string;
  size?: 'lg' | 'sm' | 'xl' | 'default' | 'xs';
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectMemberProvider
      value={value}
      onValueChange={(value) => {
        onValueChange?.(value);
        setOpen(false);
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          {!value ? (
            <Combobox.TriggerBase className={cn('font-medium', className)}>
              {placeholder || 'Add Owner'} <IconPlus />
            </Combobox.TriggerBase>
          ) : (
            <Button
              variant="ghost"
              className={cn('w-full inline-flex', className)}
            >
              <SelectMemberValue size={size} placeholder={placeholder} />
            </Button>
          )}
        </Popover.Trigger>
        <Combobox.Content>
          <SelectMemberContent />
        </Combobox.Content>
      </Popover>
    </SelectMemberProvider>
  );
};

export const SelectMemberRoot = ({
  onValueChange,
  className,
  size,
  placeholder,
  scope,
  ...props
}: Omit<React.ComponentProps<typeof SelectMemberProvider>, 'children'> & {
  className?: string;
  size?: 'lg' | 'sm' | 'xl' | 'default' | 'xs';
  placeholder?: string;
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectMemberProvider
      onValueChange={(value) => {
        onValueChange?.(value);
        if (props.mode !== 'multiple') setOpen(false);
      }}
      {...props}
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <Combobox.Trigger
          className={cn('w-full inline-flex', className)}
          variant="outline"
        >
          <SelectMemberValue size={size} placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectMemberContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectMemberProvider>
  );
};

export const SelectMemberCustomDetail = ({
  onValueChange,
  className,
  size = 'lg',
  value,
  ...props
}: Omit<React.ComponentProps<typeof SelectMemberProvider>, 'children'> & {
  className?: string;
  size?: 'lg' | 'sm' | 'xl' | 'default' | 'xs';
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectMemberProvider
      value={value}
      onValueChange={(value) => {
        onValueChange?.(value);
        if (props.mode !== 'multiple') {
          setOpen(false);
        }
      }}
      {...props}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.TriggerBase asChild>
          <Button
            variant="ghost"
            className={cn('h-7 w-auto inline-flex', className)}
          >
            <SelectMemberValue size={size} />
          </Button>
        </Combobox.TriggerBase>
        <Combobox.Content>
          <SelectMemberContent />
        </Combobox.Content>
      </Popover>
    </SelectMemberProvider>
  );
};

export const SelectMember = Object.assign(SelectMemberRoot, {
  Provider: SelectMemberProvider,
  Value: SelectMemberValue,
  Content: SelectMemberContent,
  CommandItem: SelectMemberCommandItem,
  NoAssigneeItem: SelectMemberNoAssigneeItem,
  FilterItem: SelectMemberFilterItem,
  FilterView: SelectMemberFilterView,
  FilterBar: SelectMemberFilterBar,
  InlineCell: SelectMemberInlineCell,
  FormItem: SelectMemberFormItem,
  Detail: SelectMemberDetail,
  CustomDetail: SelectMemberCustomDetail,
});
