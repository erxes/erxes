import React from 'react';

import { mutations, queries } from '../graphql';
import { gql, useQuery, useMutation } from '@apollo/client';

import History from '../components/History';
import { Alert } from '@erxes/ui/src/utils';

type Props = {
  changeMainTab: (phoneNumber: string, shiftTab: string) => void;
};

const HistoryContainer = (props: Props) => {
  let histories;
  const { changeMainTab } = props;
  const { data, loading, error, refetch } = useQuery(
    gql(queries.callHistories),
    {
      fetchPolicy: 'network-only',
    },
  );
  const [removeHistory] = useMutation(gql(mutations.callHistoryRemove), {
    refetchQueries: ['CallHistories'],
  });

  if (loading) {
    return null;
  }
  if (error) {
    Alert.error(error.message);
    return null;
  }

  const remove = (id: string) => {
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
      });
  };
  histories = data?.callHistories;

  return (
    <History
      histories={histories}
      changeMainTab={changeMainTab}
      refetch={refetch}
      remove={remove}
    />
  );
};

export default HistoryContainer;
