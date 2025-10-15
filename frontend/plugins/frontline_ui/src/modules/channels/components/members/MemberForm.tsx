import { TChannelMemberForm } from '@/channels/types';
import { UseFormReturn } from 'react-hook-form';
import { Combobox, Command, Form, Popover } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import {
  currentUserState,
  IUser,
  SelectMember,
  useSelectMemberContext,
  useUsers,
} from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useDebounce } from 'use-debounce';
import { useState } from 'react';
import React from 'react';
import { useGetChannelMembers } from '@/channels/hooks/useGetChannelMembers';

export const MemberForm = ({
  form,
}: {
  form: UseFormReturn<TChannelMemberForm>;
}) => {
  const { id: channelId } = useParams();
  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="memberIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Choose members</Form.Label>
            <Form.Description className="sr-only">Members</Form.Description>
            <SelectChannelMember
              channelId={channelId ?? ''}
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

export const SelectChannelMember = ({
  channelId,
  mode,
  value,
  onValueChange,
  exclude,
  inForm,
}: {
  channelId: string;
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
      onValueChange={(value) => onValueChange?.(value as string[] | string)}
      mode={mode}
    >
      <Popover>
        <Control>
          <Combobox.Trigger>
            <SelectMember.Value />
          </Combobox.Trigger>
        </Control>
        <Combobox.Content>
          <MemberFormContent channelId={channelId} exclude={exclude ?? true} />
        </Combobox.Content>
      </Popover>
    </SelectMember.Provider>
  );
};

export const MemberFormContent = ({
  channelId,
  exclude,
}: {
  channelId: string;
  exclude: boolean;
}) => {
  const { members: channelMembers } = useGetChannelMembers({
    channelIds: channelId,
  });
  const excludeIds = channelMembers?.map((member) => member.memberId);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const currentUser = useAtomValue(currentUserState) as IUser;
  const { memberIds, members } = useSelectMemberContext();
  const { users, loading, handleFetchMore, totalCount, error } = useUsers({
    variables: {
      searchValue: debouncedSearch,
      excludeIds: excludeIds,
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
