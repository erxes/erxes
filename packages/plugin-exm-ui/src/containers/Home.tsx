import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, Spinner, confirm } from '@erxes/ui/src';
import { router, withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import List from '../components/Home';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  listQuery: any;
  removeSyncMutation: any;
} & Props;

class ListContainer extends React.Component<FinalProps> {
  constructor(props: FinalProps) {
    super(props);
  }

  render() {
    const { queryParams, history, listQuery, removeSyncMutation } = this.props;

    // const remove = (_id) => {
    //   confirm().then(() => {
    //     removeSyncMutation({ variables: { _id } })
    //       .then(() => {
    //         Alert.success('Removed successfully');
    //       })
    //       .catch((err) => {
    //         Alert.error(err.message);
    //       });
    //   });
    // };

    if (listQuery?.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      queryParams,
      history,
      list: listQuery?.exms?.list || [],
      totalCount: listQuery?.exms?.totalCount || 0
    };

    return <List {...updatedProps} />;
  }
}

const generateParams = queryParams => {
  return {
    ...router.generatePaginationParams(queryParams || {}),
    searchValue: queryParams?.searchValue,
    categoryId: queryParams?.categoryId
  };
};

export const refetchQueries = ({ queryParams }) => {
  return [
    {
      query: gql(queries.exms),
      variables: { ...generateParams(queryParams) }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.exms), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: generateParams(queryParams)
      })
    })
  )(ListContainer)
);
