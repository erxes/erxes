import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_FORMS_CHANNEL_LIST } from '@/forms/graphql/formQueries';
import { compactList } from '@/shared/utils/cursorList';
import type { FrontlineFormsChannelListQuery } from '~/gql/graphql';

export type IFormsChannel = NonNullable<
  NonNullable<FrontlineFormsChannelListQuery['getMyChannels']>[number]
>;

export const useFormsChannelList = (name?: string) => {
  const { data, loading } = useQuery(GET_FORMS_CHANNEL_LIST, {
    variables: { name, sortField: 'name', sortDirection: 1 },
    fetchPolicy: 'cache-and-network',
  });

  const channels = useMemo(
    () => (data?.getMyChannels ? compactList(data.getMyChannels) : undefined),
    [data?.getMyChannels],
  );

  return { channels, loading };
};
