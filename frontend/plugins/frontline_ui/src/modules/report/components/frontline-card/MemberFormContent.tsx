import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import {
  IUser,
  useSelectMemberContext,
  useUsers,
  SelectMember,
} from 'ui-modules';
import { Command, Combobox } from 'erxes-ui';
import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';

export const MemberFormContent = ({
  channelIds,
  exclude,
}: {
  channelIds: string[];
  exclude: boolean;
}) => {
  const {
    members: channelMembers,
    loading: channelMembersLoading,
    error: channelMembersError,
  } = useGetChannelMembers({ channelIds });

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const { memberIds, members } = useSelectMemberContext();

  const {
    users,
    loading: usersLoading,
    handleFetchMore,
    totalCount,
    error: usersError,
  } = useUsers({
    variables: { searchValue: debouncedSearch },
    skip: channelIds.length > 0,
  });

  const {
    users: selectedUsers,
    loading: selectedUsersLoading,
    error: selectedUsersError,
  } = useUsers({
    variables: { ids: memberIds },
    skip: memberIds.length === 0,
  });

  const channelUsers = useMemo(() => {
    const usersById = new Map<string, IUser>();

    for (const channelMember of channelMembers || []) {
      const { member } = channelMember;

      if (member && member.isActive !== false) {
        usersById.set(channelMember.memberId, member);
      }
    }

    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return [...usersById.values()].filter((user) => {
      if (!normalizedSearch) {
        return true;
      }

      return [user.details?.fullName, user.email].some((value) =>
        value?.toLowerCase().includes(normalizedSearch),
      );
    });
  }, [channelMembers, debouncedSearch]);

  const availableUsers = channelIds.length ? channelUsers : users;

  const selectedMembers = useMemo(() => {
    const usersById = new Map(
      [...availableUsers, ...selectedUsers, ...members].map((user) => [
        user._id,
        user,
      ]),
    );

    return memberIds
      .map((memberId) => usersById.get(memberId))
      .filter((user): user is IUser => Boolean(user));
  }, [availableUsers, memberIds, members, selectedUsers]);

  const membersList = useMemo(() => {
    if (!exclude) return availableUsers;

    return availableUsers.filter((user) => !memberIds.includes(user._id));
  }, [availableUsers, exclude, memberIds]);

  const loading =
    (channelIds.length ? channelMembersLoading : usersLoading) ||
    selectedUsersLoading;
  const error =
    (channelIds.length ? channelMembersError : usersError) || selectedUsersError;

  return (
    <Command shouldFilter={false}>
      <Command.Input
        value={search}
        onValueChange={setSearch}
        variant="secondary"
        focusOnMount
      />

      <Command.List className="max-h-[300px] overflow-y-auto">
        <Combobox.Empty loading={loading} error={error} />

        {selectedMembers.length > 0 && (
          <>
            {selectedMembers.map((member) => (
              <SelectMember.CommandItem key={member._id} user={member} />
            ))}
            {membersList.length > 0 && <Command.Separator className="my-1" />}
          </>
        )}

        {!loading &&
          membersList.map((user) => (
            <SelectMember.CommandItem key={user._id} user={user} />
          ))}

        {channelIds.length === 0 && (
          <Combobox.FetchMore
            fetchMore={handleFetchMore}
            currentLength={users.length}
            totalCount={totalCount}
          />
        )}
      </Command.List>
    </Command>
  );
};
