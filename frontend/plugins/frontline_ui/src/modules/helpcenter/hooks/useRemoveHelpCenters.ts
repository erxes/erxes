import { useApolloClient, useMutation } from '@apollo/client';
import { HELP_CENTER_CONFIG_REMOVE } from '@/helpcenter/graphql/mutations/helpCenterConfigUpdate';
import { GET_HELP_CENTERS } from '@/helpcenter/graphql/queries/getHelpCenters';
import { useEffect } from 'react';
import { useStore } from 'jotai';
import {
  helpCenterPanelCreatedState,
  helpCenterPanelDraftsState,
  helpCenterRemovedIdsState,
  helpCenterPanelSessionState,
  observeHelpCenterSession,
} from '@/helpcenter/states/helpCenterPanelDraftsState';

/** Removes Help Centers and invalidates their cached records and drafts. */
export const useRemoveHelpCenters = () => {
  const client = useApolloClient();
  const store = useStore();
  useEffect(() => observeHelpCenterSession(store), [store]);
  const [removeConfig, { loading }] = useMutation(HELP_CENTER_CONFIG_REMOVE);

  /** Removes one Help Center and clears its cache and drafts. */
  const removeHelpCenter = (_id: string, session: number) =>
    removeConfig({
      variables: { _id },
      update: (cache) => {
        cache.evict({
          id: cache.identify({ __typename: 'HelpCenterConfig', _id }),
        });
        cache.gc();
        if (store.get(helpCenterPanelSessionState) !== session) return;
        store.set(
          helpCenterRemovedIdsState,
          (previous) => new Set([...previous, _id]),
        );
        const createdSessions = store.get(helpCenterPanelCreatedState);
        store.set(helpCenterPanelDraftsState, (drafts) =>
          Object.fromEntries(
            Object.entries(drafts).filter(
              ([key]) =>
                !key.endsWith(`:${_id}`) && createdSessions[key]?.id !== _id,
            ),
          ),
        );
        store.set(helpCenterPanelCreatedState, (previous) =>
          Object.fromEntries(
            Object.entries(previous).filter(
              ([, session]) => session.id !== _id,
            ),
          ),
        );
      },
    });

  /** Removes selected Help Centers and invalidates cached data. */
  const removeHelpCenters = async (ids: string[]) => {
    const session = store.get(helpCenterPanelSessionState);
    await Promise.all(ids.map((id) => removeHelpCenter(id, session)));

    await client.refetchQueries({ include: [GET_HELP_CENTERS] });
  };

  return { removeHelpCenters, loading };
};
