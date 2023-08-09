import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, confirm } from '@erxes/ui/src/utils';
import WelcomeList from '../components/WelcomeList';

type Props = {
  queryParams: any;
  contentType: string;
};

export default function ListContainer(props: Props) {
  const { queryParams, contentType } = props;

  const limit =
    queryParams && queryParams.limit ? parseInt(queryParams.limit, 10) : 20;

  const feedResponse = useQuery(gql(queries.feed), {
    variables: {
      limit,
      contentTypes: [contentType || 'post']
    }
  });

  const [deleteMutation] = useMutation(gql(mutations.deleteFeed));
  const [pinMutation] = useMutation(gql(mutations.pinFeed));

  if (feedResponse.loading) {
    return <Spinner objective={true} />;
  }

  const pinItem = (_id: string) => {
    pinMutation({ variables: { _id } })
      .then(() => {
        Alert.success('Success!');

        feedResponse.refetch();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const deleteItem = (_id: string) => {
    confirm().then(() => {
      deleteMutation({ variables: { _id } })
        .then(() => {
          Alert.success('You successfully deleted.');

          feedResponse.refetch();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const { list, totalCount } = feedResponse.data.exmFeed || {};

  if (contentType === 'welcome') {
    return <WelcomeList list={list} totalCount={totalCount} limit={limit} />;
  }

  return (
    <List
      deleteItem={deleteItem}
      pinItem={pinItem}
      list={list}
      totalCount={totalCount}
      limit={limit}
    />
  );
}
