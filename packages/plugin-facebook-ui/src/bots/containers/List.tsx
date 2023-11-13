import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import ListComponent from '../components/List';
import { mutations, queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  queryParams: any;
};

type FinalProps = {
  listQueryResponse;
  totalCountQueryResponse;
  removeMutation;
} & Props;

class List extends React.Component<FinalProps> {
  render() {
    const {
      listQueryResponse,
      totalCountQueryResponse,
      removeMutation
    } = this.props;

    if (listQueryResponse?.loading) {
      return <Spinner />;
    }

    const remove = (_id: string) => {
      confirm('Are you sure?').then(() => {
        removeMutation({ variables: { _id } })
          .then(() => {
            listQueryResponse.refetch();
            Alert.success('You successfully removed bot');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const updatedProps = {
      list: listQueryResponse?.facebootMessengerBots || [],
      totalCount:
        totalCountQueryResponse?.facebootMessengerBotsTotalCount || [],
      remove
    };

    return <ListComponent {...updatedProps} />;
  }
}

export const refetchQueries = _queryParams => {
  return [
    {
      query: gql(queries.list)
    },
    {
      query: gql(queries.totalCount)
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.list), {
      name: 'listQueryResponse'
    }),
    graphql<Props>(gql(queries.totalCount), {
      name: 'totalCountQueryResponse'
    }),
    graphql(gql(mutations.removeBot), {
      name: 'removeMutation'
    })
  )(List)
);
