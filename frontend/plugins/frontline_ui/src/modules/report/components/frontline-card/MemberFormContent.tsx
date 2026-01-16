import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';
import {
  currentUserState,
  IUser,
  useSelectMemberContext,
  useUsers,
  SelectMember,
} from 'ui-modules';
import { Command, Combobox } from 'erxes-ui';
import { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { useAtomValue } from 'jotai';

export const MemberFormContent = ({
  channelIds,
  exclude,
}: {
  channelIds: string[];
  exclude: boolean;
}) => {
  const { members: channelMembers } = useGetChannelMembers({ channelIds });

  const excludedMemberIds = useMemo(
    () => channelMembers?.map((m) => m.memberId) || [],
    [channelMembers],
  );

  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);

  const currentUser = useAtomValue(currentUserState) as IUser;
  const { memberIds, members } = useSelectMemberContext();

  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
      excludeIds: true,
      ids: [currentUser._id, ...excludedMemberIds],
    },
  });

  const membersList = useMemo(() => {
    if (!exclude) return users;

    return [currentUser, ...users].filter(
      (user) =>
        !memberIds?.includes(user._id) && !excludedMemberIds.includes(user._id),
    );
  }, [users, memberIds, excludedMemberIds, exclude, currentUser]);

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

        {members.map((member) => (
          <SelectMember.CommandItem key={member._id} user={member} />
        ))}

        <Command.Separator className="my-1" />

        {!loading &&
          membersList.map((user) => (
            <SelectMember.CommandItem key={user._id} user={user} />
          ))}

        <Combobox.FetchMore
          fetchMore={handleFetchMore}
          currentLength={membersList.length}
          totalCount={totalCount}
        />
      </Command.List>
    </Command>
  );
};
