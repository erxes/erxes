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
import {
  SelectMemberContext,
  useSelectMemberContext,
} from '../contexts/SelectMemberContext';

import { IUser } from '../types/TeamMembers';
import { IconPlus, IconUser } from '@tabler/icons-react';
import { MembersInline } from './MembersInline';
import React from 'react';
import { currentUserState } from 'ui-modules/states';
import { useAtomValue } from 'jotai';
import { useDebounce } from 'use-debounce';
import { useState } from 'react';
import { useUsers } from 'ui-modules/modules';

const SelectMemberProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  members,
  setOpen,
  allowUnassigned,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange?: (value: string[] | string | null) => void;
  members?: IUser[];
  setOpen?: (open: boolean) => void;
  allowUnassigned?: boolean;
}) => {
  const [_members, setMembers] = useState<IUser[]>(members || []);
  const isSingleMode = mode === 'single';

  const onSelect = (member: IUser | null) => {
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

    setMembers((prev) =>
      [...prev, member].filter((m) => newSelectedMemberIds.includes(m._id)),
    );
    onValueChange?.(newSelectedMemberIds);
  };

  return (
    <SelectMemberContext.Provider
      value={{
        memberIds: !value ? [] : Array.isArray(value) ? value : [value],
        onSelect,
        members: _members,
        setMembers,
        loading: _members.length !== value?.length,
        allowUnassigned: allowUnassigned || false,
      }}
    >
      {children}
    </SelectMemberContext.Provider>
  );
};

const SelectMemberValue = ({
  placeholder,
  size,
}: {
  placeholder?: string;
  size?: AvatarProps['size'];
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
    />
  );
};

const SelectMemberCommandItem = ({ user }: { user: IUser }) => {
  const { onSelect, memberIds } = useSelectMemberContext();

  return (
    <Command.Item
      value={user._id}
      onSelect={() => {
        onSelect(user);
      }}
    >
      <MembersInline
        members={[
          {
            ...user,
          },
        ]}
        placeholder="Unnamed user"
      />
      <Combobox.Check checked={memberIds.includes(user._id)} />
    </Command.Item>
  );
};

const SelectMemberNoAssigneeItem = () => {
  const { onSelect, memberIds } = useSelectMemberContext();
  return (
    <Command.Item value="no-assignee" onSelect={() => onSelect(null)}>
      <MembersInline
        memberIds={[]}
        placeholder="Unnamed user"
        allowUnassigned
      />
      <Combobox.Check checked={!memberIds || memberIds.length === 0} />
    </Command.Item>
  );
};

const SelectMemberContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { memberIds, members, allowUnassigned } = useSelectMemberContext();
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
      excludeIds: true,
      ids: [currentUser?._id],
    },
  });

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
        {members.length > 0 && (
          <>
            {members.map((member) => (
              <SelectMemberCommandItem key={member._id} user={member} />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {!loading && allowUnassigned && <SelectMemberNoAssigneeItem />}

        {!loading &&
          [currentUser, ...users]
            .filter(
              (user) => !memberIds.find((memberId) => memberId === user._id),
            )
            .map((user) => (
              <SelectMemberCommandItem key={user._id} user={user} />
            ))}

        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={users.length}
          totalCount={totalCount}
        />
      </Command.List>
    </Command>
  );
};

export const SelectMemberFilterItem = () => {
  return (
    <Filter.Item value="assignedTo">
      <IconUser />
      Assigned To
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
}: {
  iconOnly?: boolean;
  onValueChange?: (value: string[] | string | null) => void;
  queryKey?: string;
  mode?: 'single' | 'multiple';
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
        {!iconOnly && 'Assigned To'}
      </Filter.BarName>
      <SelectMemberProvider
        mode={mode}
        value={assignedTo || (mode === 'single' ? '' : [])}
        onValueChange={(value) => {
          setAssignedTo(null);
          setOpen(false);
          onValueChange?.(value);
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
        setOpen(false);
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
            <Combobox.TriggerBase className="font-medium">
              Add Owner <IconPlus />
            </Combobox.TriggerBase>
          ) : (
            <Button variant="ghost" className="w-full inline-flex">
              <SelectMemberValue size={size} />
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
        setOpen(false);
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
});
