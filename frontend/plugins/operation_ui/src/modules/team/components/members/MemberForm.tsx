import { Combobox, Command, Form, Popover } from 'erxes-ui';
import {
  currentUserState,
  IUser,
  SelectMember,
  useUsers,
  useSelectMemberContext,
} from 'ui-modules';
import { UseFormReturn } from 'react-hook-form';
import { TTeamMemberForm } from '@/team/types';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useAtomValue } from 'jotai';
import { useGetTeamMembers } from '@/team/hooks/useGetTeamMembers';
import { useParams } from 'react-router';
import React from 'react';

export const MemberForm = ({
  form,
}: {
  form: UseFormReturn<TTeamMemberForm>;
}) => {
  const { id: teamId } = useParams();
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="memberIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Choose members</Form.Label>
            <Form.Description className="sr-only">Members</Form.Description>
            <SelectTeamMember
              teamId={teamId}
              mode="multiple"
              value={field.value}
              onValueChange={field.onChange}
              inForm={true}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};

export const SelectTeamMember = ({
  teamId,
  mode,
  value,
  onValueChange,
  exclude,
  inForm,
}: {
  teamId?: string;
  mode: 'multiple' | 'single';
  value?: string[];
  onValueChange?: (value: string[] | string) => void;
  exclude?: boolean;
  inForm?: boolean;
}) => {
  const Control = inForm ? Form.Control : React.Fragment;
  return (
    <SelectMember.Provider
      value={value}
      onValueChange={onValueChange}
      mode={mode}
    >
      <Popover>
        <Control>
          <Combobox.Trigger>
            <SelectMember.Value />
          </Combobox.Trigger>
        </Control>
        <Combobox.Content>
          <MemberFormContent teamId={teamId} exclude={exclude ?? true} />
        </Combobox.Content>
      </Popover>
    </SelectMember.Provider>
  );
};

export const MemberFormContent = ({
  teamId,
  exclude,
}: {
  teamId?: string;
  exclude: boolean;
}) => {
  const { members: teamMembers } = useGetTeamMembers({ teamIds: teamId });
  const excludeIds = teamMembers?.map((member) => member.memberId);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { memberIds, members } = useSelectMemberContext();
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
      excludeIds: exclude,
      ids: [currentUser?._id, ...(excludeIds || [])],
    },
  });
  const membersList = exclude
    ? [currentUser, ...users].filter(
        (user) =>
          !memberIds?.find((memberId) => memberId === user._id) &&
          !excludeIds?.find((excludeId) => excludeId === user._id),
      )
    : users;
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
            <Command.Separator className="my-1" />
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
