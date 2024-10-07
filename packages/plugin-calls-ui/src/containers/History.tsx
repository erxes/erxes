import { Alert, confirm } from '@erxes/ui/src/utils';
import React, { useCallback, useEffect, useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';

import History from '../components/History';
import { IHistory } from '../types';
import { useNavigate } from 'react-router-dom';

type Props = {
  changeMainTab: (phoneNumber: string, shiftTab: string) => void;
  callUserIntegrations?: any;
};

const HistoryContainer = (props: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const [items, setItems] = useState<IHistory[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  const navigate = useNavigate();

  const { changeMainTab, callUserIntegrations } = props;
  const defaultCallIntegration = localStorage.getItem(
    'config:call_integrations',
  );

  const inboxId =
    JSON.parse(defaultCallIntegration || '{}')?.inboxId ||
    callUserIntegrations?.[0]?.inboxId;

  const { data, loading, error, refetch, fetchMore } = useQuery(
    gql(queries.callHistories),
    {
      variables: {
        integrationId: inboxId,
        searchValue,
        limit: 20,
        skip: 0,
      },
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        setItems(data.callHistories);
        setHasMore(data.callHistories.length === 20);
        setSkip(20);
      },
    },
  );

  const callHistoriesTotalCountQuery = useQuery(
    gql(queries.callHistoriesTotalCount),
    {
      variables: {
        integrationId: inboxId,
      },
    },
  );

  const totalCount =
    callHistoriesTotalCountQuery?.data?.callHistoriesTotalCount || 0;

  const [removeHistory] = useMutation(gql(mutations.callHistoryRemove), {
    refetchQueries: ['CallHistories'],
  });

  useEffect(() => {
    if (data && data.callHistories) setItems(data.callHistories);
  }, [data]);

  const onLoadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    await fetchMore({
      variables: {
        skip: items.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          ...prev,
          callHistories: [
            ...prev.callHistories,
            ...fetchMoreResult.callHistories,
          ],
        };
      },
    }).then((fetchMoreResult) => {
      setItems((prevItems) => [
        ...prevItems,
        ...fetchMoreResult.data.callHistories,
      ]);
      setHasMore(fetchMoreResult.data.callHistories.length === 20);
      setSkip((prevSkip) => prevSkip + 20);
    });
  }, [loading, hasMore, items.length, fetchMore]);

  if (error) {
    Alert.error(error.message);
  }

  const onSearch = (searchValue: string) => {
    setSearchValue(searchValue);
  };

  const remove = (id: string) => {
    confirm().then(() =>
      removeHistory({
        variables: {
          id,
        },
      })
        .then(() => {
          Alert.success('Successfully removed');
        })
        .catch((e) => {
          Alert.error(e.message);
        }),
    );
  };

  return (
    <History
      histories={items}
      loading={loading || callHistoriesTotalCountQuery?.loading}
      changeMainTab={changeMainTab}
      refetch={refetch}
      remove={remove}
      onSearch={onSearch}
      searchValue={searchValue}
      navigate={navigate}
      onLoadMore={onLoadMore}
      totalCount={totalCount || 0}
    />
  );
};

export default HistoryContainer;
