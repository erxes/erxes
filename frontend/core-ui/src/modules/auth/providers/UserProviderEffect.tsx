import { useEffect, useState } from 'react';

import { useQuery } from '@apollo/client';
import { currentUserState, isCurrentUserLoadedState } from 'ui-modules';

import { isDefined } from 'erxes-ui';

import { currentUser } from '@/auth/graphql/queries/currentUser';
import { useSetAtom, useAtom } from 'jotai';

export const UserProviderEffect = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [isCurrentUserLoaded, setIsCurrentUserLoaded] = useAtom(
    isCurrentUserLoadedState,
  );

  const setCurrentUser = useSetAtom(currentUserState);

  const {
    loading: queryLoading,
    data: queryData,
    refetch,
  } = useQuery(currentUser);

  useEffect(() => {
    if (!queryLoading) {
      setIsLoading(false);
      setIsCurrentUserLoaded(true);
    }

    if (!isDefined(queryData?.currentUser)) return;

    setCurrentUser(queryData.currentUser);
  }, [
    setCurrentUser,
    isLoading,
    queryLoading,
    queryData?.currentUser,
    setIsCurrentUserLoaded,
    queryData,
  ]);

  useEffect(() => {
    if (!isCurrentUserLoaded) {
      refetch();
    }
  }, [isCurrentUserLoaded, refetch]);

  return null;
};
