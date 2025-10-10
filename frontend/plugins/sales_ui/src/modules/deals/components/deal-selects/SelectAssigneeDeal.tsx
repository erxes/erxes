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
  IUser,
  MembersInline,
  SelectMember,
  currentUserState,
  useSelectMemberContext,
  useUsers,
} from 'ui-modules';
import {
  SelectOperationContent,
  SelectTriggerOperation,
  SelectTriggerVariant,
} from '@/deals/components/deal-selects/SelectOperation';

import { useAtomValue } from 'jotai';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { useDebounce } from 'use-debounce';
import { useGetTeamMembers } from '@/deals/boards/hooks/useGetTeamMembers';
import { useState } from 'react';

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

const SelectTeamMemberContent = ({
  teamIds,
  exclude,
}: {
  teamIds?: string[] | string;
  exclude: boolean;
}) => {
  const { members: teamMembers } = useGetTeamMembers({ teamIds });
  const excludeIds = teamMembers?.map((member) => member.memberId);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { memberIds, members } = useSelectMemberContext();
  const filteredIds = excludeIds?.filter((id) => id !== currentUser._id);
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
      excludeIds: exclude,
      ids: filteredIds,
    },
    skip: !excludeIds || !filteredIds?.length,
  });
  const membersList = exclude
    ? [currentUser, ...users].filter(
        (user) =>
          !memberIds?.find((memberId) => memberId === user._id) &&
          !excludeIds?.find((excludeId) => excludeId === user._id),
      )
    : [currentUser, ...users].filter(
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

const SelectAssigneeFilterView = ({
  teamIds,
}: {
  teamIds?: string[] | string;
}) => {
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
        <SelectTeamMemberContent exclude={false} teamIds={teamIds} />
      </SelectAssigneeProvider>
    </Filter.View>
  );
};

export const SelectAssigneeFilterBar = ({
  teamIds,
}: {
  teamIds?: string[] | string;
}) => {
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
          <SelectTeamMemberContent teamIds={teamIds} exclude={false} />
        </Combobox.Content>
      </Popover>
    </SelectAssigneeProvider>
  );
};

const SelectAssigneeDealRoot = ({
  scope,
  value,
  variant,
  id,
  teamIds,
}: {
  value: string[];
  scope?: string;
  variant: `${SelectTriggerVariant}`;
  teamIds?: string[] | string;
  id?: string;
}) => {
  const { editDeals } = useDealsEdit();
  const [open, setOpen] = useState(false);

  const handleValueChange = (value: string | string[] | null) => {
    if (id) {
      editDeals({
        variables: {
          _id: id,
          assignedUserIds: [value],
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
        <SelectTriggerOperation variant={variant === 'card' ? 'icon' : variant}>
          <SelectAssigneeValue variant={variant} />
        </SelectTriggerOperation>
        <SelectOperationContent variant={variant}>
          <SelectTeamMemberContent teamIds={teamIds} exclude={false} />
        </SelectOperationContent>
      </PopoverScoped>
    </SelectAssigneeProvider>
  );
};

export const SelectAssigneeDealFormItem = ({
  value,
  onValueChange,
  scope,
  teamIds,
}: {
  value: string[];
  onValueChange: (value: string[] | null) => void;
  scope?: string;
  teamIds?: string[] | string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SelectAssigneeProvider
      value={value}
      onValueChange={(value) => {
        onValueChange(value as string[]);
        setOpen(false);
      }}
      mode="single"
      allowUnassigned
    >
      <PopoverScoped open={open} onOpenChange={setOpen} scope={scope}>
        <SelectTriggerOperation variant="form">
          <SelectAssigneeValue />
        </SelectTriggerOperation>
        <Combobox.Content>
          <SelectTeamMemberContent teamIds={teamIds} exclude={false} />
        </Combobox.Content>
      </PopoverScoped>
    </SelectAssigneeProvider>
  );
};

export const SelectAssigneeDeal = Object.assign(SelectAssigneeDealRoot, {
  FormItem: SelectAssigneeDealFormItem,
  FilterView: SelectAssigneeFilterView,
  FilterBar: SelectAssigneeFilterBar,
});
