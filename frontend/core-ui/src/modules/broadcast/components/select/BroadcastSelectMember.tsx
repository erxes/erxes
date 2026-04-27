import {
  BroadcastMemberContext,
  useBroadcastMemberContext,
} from '@/broadcast/context/BroadcastMemberContext';
import { useBroadcastMembers } from '@/broadcast/hooks/useBroadcastMembers';
import { AvatarProps, cn, Combobox, Command, Form, Popover } from 'erxes-ui';
import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { BroadcastMemberInline } from '../BroadcastMemberInline';

export const SelectMemberProvider = ({
  children,
  mode = 'single',
  value,
  onValueChange,
  members,
  variables,
}: {
  children: React.ReactNode;
  mode?: 'single' | 'multiple';
  value?: string[] | string;
  onValueChange: (value: string[] | string, meta: any) => void;
  members?: any[];
  variables?: any;
}) => {
  const [_members, setMembers] = useState<any[]>(members || []);
  const isSingleMode = mode === 'single';

  const onSelect = (member: any) => {
    if (!member) return;

    if (isSingleMode) {
      setMembers([member]);
      return onValueChange?.(member._id, member);
    }

    const arrayValue = Array.isArray(value) ? value : [];

    const isMemberSelected = arrayValue.includes(member._id);
    const newSelectedMemberIds = isMemberSelected
      ? arrayValue.filter((id) => id !== member._id)
      : [...arrayValue, member._id];

    setMembers((prev) =>
      [...prev, member].filter((b) => newSelectedMemberIds.includes(b._id)),
    );

    onValueChange?.(newSelectedMemberIds, member);
  };

  return (
    <BroadcastMemberContext.Provider
      value={{
        memberIds: !value ? [] : Array.isArray(value) ? value : [value],
        onSelect,
        setMembers,
        members: _members,
        loading: false,
        variables,
      }}
    >
      {children}
    </BroadcastMemberContext.Provider>
  );
};

const SelectMemberValue = ({
  placeholder,
  size,
}: {
  placeholder?: string;
  size?: AvatarProps['size'];
}) => {
  const { memberIds, members, setMembers } = useBroadcastMemberContext();

  return (
    <BroadcastMemberInline
      memberIds={memberIds}
      members={members}
      updateMembers={setMembers}
      placeholder={placeholder}
      size={size}
    />
  );
};

const SelectMemberCommandItem = ({ member }: { member: any }) => {
  const { onSelect, memberIds } = useBroadcastMemberContext();

  return (
    <Command.Item
      value={member._id}
      onSelect={() => {
        onSelect(member);
      }}
    >
      <BroadcastMemberInline
        members={[
          {
            ...member,
          },
        ]}
      />
      <Combobox.Check checked={memberIds.includes(member._id)} />
    </Command.Item>
  );
};

const SelectMemberContent = () => {
  const [search, setSearch] = React.useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const {
    memberIds,
    members: selectedMembers,
    variables,
  } = useBroadcastMemberContext();

  const {
    members = [],
    loading,
    handleFetchMore,
    totalCount = 0,
  } = useBroadcastMembers({
    variables: {
      searchValue: debouncedSearch,
      ...variables,
    },
  });

  return (
    <Command shouldFilter={false} id="member-command-menu">
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        wrapperClassName="flex-auto"
        placeholder="Search member..."
        className="h-9"
      />
      <Command.List>
        <Combobox.Empty loading={loading} />
        {selectedMembers.length > 0 && (
          <>
            {selectedMembers?.map((member) => (
              <SelectMemberCommandItem key={member._id} member={member} />
            ))}
            <Command.Separator className="my-1" />
          </>
        )}
        {members
          .filter(
            (member) => !memberIds.find((memberId) => memberId === member._id),
          )
          .map((member) => (
            <SelectMemberCommandItem key={member._id} member={member} />
          ))}
        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          totalCount={totalCount}
          currentLength={members.length}
        />
      </Command.List>
    </Command>
  );
};

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
      onValueChange={(value, meta) => {
        onValueChange?.(value, meta);
        props.mode !== 'multiple' && setOpen(false);
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

SelectMemberFormItem.displayName = 'SelectMemberFormItem';

const SelectMemberRoot = React.forwardRef<
  React.ElementRef<typeof Combobox.Trigger>,
  Omit<React.ComponentProps<typeof SelectMemberProvider>, 'children'> &
    React.ComponentProps<typeof Combobox.Trigger> & {
      placeholder?: string;
    }
>(({ onValueChange, className, mode, value, placeholder, ...props }, ref) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectMemberProvider
      onValueChange={(value, meta) => {
        onValueChange?.(value, meta);
        setOpen(false);
      }}
      mode={mode}
      value={value}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger
          ref={ref}
          className={cn('w-full inline-flex', className)}
          variant="outline"
          {...props}
        >
          <SelectMemberValue placeholder={placeholder} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectMemberContent />
        </Combobox.Content>
      </Popover>
    </SelectMemberProvider>
  );
});

SelectMemberRoot.displayName = 'SelectMemberRoot';

export const SelectBroadcastMember = Object.assign(SelectMemberRoot, {
  Provider: SelectMemberProvider,
  Value: SelectMemberValue,
  Content: SelectMemberContent,
  FormItem: SelectMemberFormItem,
});
