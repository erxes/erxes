import { useState } from 'react';
import { Combobox, Command, PopoverScoped } from 'erxes-ui';
import { SelectMember, useSelectMemberContext, useUsers } from 'ui-modules';
import { useDebounce } from 'use-debounce';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';

const SelectAssignedMembersProvider = SelectMember.Provider;

const SelectAssignedMembersValue = ({
  placeholder,
}: {
  placeholder?: string;
}) => {
  return (
    <SelectMember.Value
      placeholder={placeholder || 'Select assigned members'}
    />
  );
};

const SelectAssignedMembersContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const { members } = useSelectMemberContext();
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
    },
  });

  const membersList = users.filter(
    (user) => !members.find((member) => member._id === user._id),
  );
  const selectableMembers = members.filter(
    (member) => member.isActive !== false && !member.isDeleted,
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
        {selectableMembers.length > 0 && (
          <>
            {selectableMembers.map((member) => (
              <SelectMember.CommandItem key={member._id} user={member} />
            ))}
            {!loading && membersList.length > 0 && (
              <Command.Separator className="my-1" />
            )}
          </>
        )}
        {!loading &&
          membersList.map((user) => (
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

const SelectAssignedMembersTicketRoot = ({
  scope,
  value,
  variant,
  id,
  disabled,
}: {
  value?: string[];
  scope?: string;
  variant: `${SelectTriggerVariant}`;
  id?: string;
  disabled?: boolean;
}) => {
  const { updateTicket } = useUpdateTicket();
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: string | string[] | null) => {
    if (id) {
      updateTicket({
        variables: {
          _id: id,
          assignedMembers: value || [],
        },
      });
    }
  };

  return (
    <SelectAssignedMembersProvider
      value={value || []}
      onValueChange={handleValueChange}
      mode="multiple"
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerTicket
          variant={variant === 'card' ? 'icon' : variant}
          disabled={disabled}
        >
          <SelectAssignedMembersValue />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectAssignedMembersContent />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectAssignedMembersProvider>
  );
};

export const SelectAssignedMembersTicket = Object.assign(
  SelectAssignedMembersTicketRoot,
  {
    Provider: SelectAssignedMembersProvider,
    Content: SelectAssignedMembersContent,
  },
);
