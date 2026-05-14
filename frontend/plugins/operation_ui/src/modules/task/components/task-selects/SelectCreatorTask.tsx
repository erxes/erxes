import { useState } from 'react';
import {
  Combobox,
  Command,
  Filter,
  Popover,
  useFilterContext,
  useQueryState,
} from 'erxes-ui';
import {
  useUsers,
  SelectMember,
  currentUserState,
  IUser,
  useSelectMemberContext,
} from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useDebounce } from 'use-debounce';

const SelectCreatorProvider = SelectMember.Provider;

const SelectCreatorValue = ({ placeholder }: { placeholder?: string }) => {
  return <SelectMember.Value placeholder={placeholder || 'Select creator'} />;
};

const SelectCreatorContent = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { members } = useSelectMemberContext();
  
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
    },
  });

  const usersList = [currentUser, ...users].filter(
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
            {!loading && usersList.length > 0 && (
              <Command.Separator className="my-1" />
            )}
          </>
        )}

        {!loading &&
          usersList.map((user: IUser) => (
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

const SelectCreatorFilterView = () => {
  const [createdBy, setCreatedBy] = useQueryState<string>('createdBy');
  const { resetFilterState } = useFilterContext();
  
  return (
    <Filter.View filterKey="createdBy">
      <SelectCreatorProvider
        mode="single"
        value={createdBy ?? undefined}
        onValueChange={(value) => {
          setCreatedBy(value as string);
          resetFilterState();
        }}
      >
        <SelectCreatorContent />
      </SelectCreatorProvider>
    </Filter.View>
  );
};

export const SelectCreatorFilterBar = () => {
  const [createdBy, setCreatedBy] = useQueryState<string>('createdBy');
  const [open, setOpen] = useState(false);
  
  return (
    <SelectCreatorProvider
      mode="single"
      value={createdBy ?? undefined}
      onValueChange={(value) => {
        setCreatedBy(value as string);
        setOpen(false);
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Filter.BarButton filterKey={'createdBy'}>
            <SelectCreatorValue />
          </Filter.BarButton>
        </Popover.Trigger>
        <Combobox.Content>
          <SelectCreatorContent />
        </Combobox.Content>
      </Popover>
    </SelectCreatorProvider>
  );
};

export const SelectCreatorTask = {
  FilterView: SelectCreatorFilterView,
  FilterBar: SelectCreatorFilterBar,
};
