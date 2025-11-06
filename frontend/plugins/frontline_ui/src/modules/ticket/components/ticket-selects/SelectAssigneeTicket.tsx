import { useState } from 'react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  PopoverScoped,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import {
  useUsers,
  SelectMember,
  currentUserState,
  IUser,
  useSelectMemberContext,
  MembersInline,
} from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useDebounce } from 'use-debounce';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';

const SelectAssigneeProvider = SelectMember.Provider;

const SelectAssigneeValue = ({
  placeholder,
  variant,
}: {
  placeholder?: string;
  variant?: `${SelectTriggerVariant}`;
}) => {
  const { memberIds, members, setMembers } = useSelectMemberContext();
  if (variant === SelectTriggerVariant.CARD) {
    return (
      <MembersInline.Provider
        memberIds={memberIds}
        members={members}
        allowUnassigned
        updateMembers={setMembers}
      >
        <MembersInline.Avatar />
      </MembersInline.Provider>
    );
  }
  return <SelectMember.Value placeholder={placeholder || 'Select assignee'} />;
};

const SelectTeamMemberContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { members } = useSelectMemberContext();
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
    },
  });

  const filteredUsers = users.filter((user) => user._id !== currentUser._id);

  const membersList = [currentUser, ...filteredUsers].filter(
    (user) => !members.find((member) => member._id === user._id),
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
        {members.length > 0 && (
          <>
            {members.map((member) => (
              <SelectMember.CommandItem key={member._id} user={member} />
            ))}
            {!loading && membersList.length > 0 && (
              <Command.Separator className="my-1" />
            )}
          </>
        )}

        {!loading && <SelectMember.NoAssigneeItem />}
        {!loading &&
          membersList.map((user: IUser) => (
            <SelectMember.CommandItem key={user._id} user={user} />
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

const SelectAssigneeFilterView = () => {
  const [assignee, setAssignee] = useQueryState<string>('assignee');
  const { resetFilterState } = useFilterContext();
  return (
    <Filter.View filterKey="assignee">
      <SelectAssigneeProvider
        mode="single"
        value={assignee || ''}
        onValueChange={(value) => {
          setAssignee(value as string);
          resetFilterState();
        }}
      >
        <SelectTeamMemberContent />
      </SelectAssigneeProvider>
    </Filter.View>
  );
};

export const SelectAssigneeFilterBar = () => {
  const [assignee, setAssignee] = useQueryState<string>('assignee');
  const [open, setOpen] = useState(false);
  return (
    <SelectAssigneeProvider
      mode="single"
      value={assignee || ''}
      onValueChange={(value) => {
        if (value) {
          setAssignee(value as string);
        } else {
          setAssignee(null);
        }
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={'assignee'}>
            <SelectAssigneeValue />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <SelectTeamMemberContent />
        </Combobox.Content>
      </Popover>
    </SelectAssigneeProvider>
  );
};

const SelectAssigneeTicketRoot = ({
  scope,
  value,
  variant,
  id,
}: {
  value: string;
  scope?: string;
  variant: `${SelectTriggerVariant}`;
  id?: string;
}) => {
  const { updateTicket } = useUpdateTicket();
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: string | string[] | null) => {
    if (id) {
      updateTicket({
        variables: {
          _id: id,
          assigneeId: value,
        },
      });
    }
    setOpen(false);
  };

  return (
    <SelectAssigneeProvider
      value={value}
      onValueChange={handleValueChange}
      mode="single"
      allowUnassigned
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerTicket variant={variant === 'card' ? 'icon' : variant}>
          <SelectAssigneeValue variant={variant} />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectTeamMemberContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectAssigneeProvider>
  );
};

export const SelectAssigneeTicketFormItem = ({
  value,
  onValueChange,
  scope,
}: {
  value: string;
  onValueChange: (value: string) => void;
  scope?: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectAssigneeProvider
      value={value}
      onValueChange={(value) => {
        onValueChange(value as string);
        setOpen(false);
      }}
      mode="single"
      allowUnassigned
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerTicket variant="form">
          <SelectAssigneeValue />
        </SelectTriggerTicket>
        <Combobox.Content>
          <SelectTeamMemberContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectAssigneeProvider>
  );
};

export const SelectAssigneeTicket = Object.assign(SelectAssigneeTicketRoot, {
  FormItem: SelectAssigneeTicketFormItem,
  FilterView: SelectAssigneeFilterView,
  FilterBar: SelectAssigneeFilterBar,
});
