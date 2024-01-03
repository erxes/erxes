import { mutations, queries } from '../../graphql';
import { useMutation, useQuery } from '@apollo/client';

import Alert from '../../../utils/Alert';
import List from '../../components/feed/List';
import WelcomeList from '../../components/feed/WelcomeList';
import React from 'react';
import { confirm } from '../../../utils';
import gql from 'graphql-tag';

type Props = {
  queryParams: any;
  contentType: string;
};

export default function ListContainer(props: Props) {
  const { contentType } = props;

  const feedResponse = useQuery(gql(queries.feed), {
    variables: {
      contentTypes: [contentType || 'post']
    }
  });

  const [deleteMutation] = useMutation(gql(mutations.deleteFeed));
  const [pinMutation] = useMutation(gql(mutations.pinFeed));

  if (feedResponse.loading) {
    return null;
  }

  const loadMore = () => {
    const feedLength = feedResponse.data.exmFeed.list.length || 0;

    feedResponse.fetchMore({
      variables: {
        skip: feedLength
      },
      updateQuery(prev, { fetchMoreResult }) {
        if (!fetchMoreResult) {
          return prev;
        }

        const fetchedExmFeed = fetchMoreResult.exmFeed.list || [];

        const prevExmFeed = prev.exmFeed.list || [];

        if (fetchedExmFeed) {
          return {
            ...prev,
            exmFeed: {
              ...prev.exmFeed,
              list: [...prevExmFeed, ...fetchedExmFeed]
            }
          };
        }
      }
    });
  };

  const pinItem = (_id: string) => {
    pinMutation({ variables: { _id } })
      .then(() => {
        Alert.success('Success!');

        feedResponse.refetch();
      })
      .catch((error) => {
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
        .catch((error) => {
          Alert.error(error.message);
        });
    });
  };

  const exmFeed = feedResponse.data?.exmFeed.list || [];
  const totalCount = feedResponse.data?.exmFeed.totalCount || 0;

  if (contentType === 'welcome') {
    return (
      <WelcomeList list={exmFeed} totalCount={totalCount} loadMore={loadMore} />
    );
  }

  return (
    <List
      deleteItem={deleteItem}
      pinItem={pinItem}
      list={exmFeed}
      totalCount={totalCount}
      contentType={contentType}
      loadMore={loadMore}
    />
  );
}
