import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import Spinner from '@erxes/ui/src/components/Spinner';
import { QueryResponse } from '@erxes/ui/src/types';
import Alert from '@erxes/ui/src/utils/Alert/index';
import confirm from '@erxes/ui/src/utils/confirmation/confirm';
import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import ListComponent from '../components/List';
import { mutations, queries } from '../graphql';

type Props = {};

type RemoveMutationResponse = {
  removeMutationResponse: (params: {
    variables: { _id: string };
  }) => Promise<any>;
};

type FinalProps = {
  safetyTipsQueryResponse: { safetyTips: any[] } & QueryResponse;
  totalCountQueryResponse: { safetyTipsTotalCount: number } & QueryResponse;
} & Props &
  RemoveMutationResponse;

class List extends React.Component<FinalProps> {
  render() {
    const {
      safetyTipsQueryResponse,
      totalCountQueryResponse,
      removeMutationResponse
    } = this.props;

    if (safetyTipsQueryResponse.loading) {
      return <Spinner />;
    }

    const { safetyTips } = safetyTipsQueryResponse;
    const { safetyTipsTotalCount } = totalCountQueryResponse;

    const remove = _id => {
      confirm()
        .then(() => {
          removeMutationResponse({ variables: { _id } });
          Alert.success('Removed successfully');
        })
        .catch(err => {
          Alert.error(err.message);
        });
    };

    const updatedProps = {
      list: safetyTips,
      totalCount: safetyTipsTotalCount,
      remove
    };

    return <ListComponent {...updatedProps} />;
  }
}

export const refetchQueries = () => [
  {
    query: gql(queries.safetyTips)
  },
  {
    query: gql(queries.safetyTipsTotalCount)
  }
];

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.safetyTips), {
      name: 'safetyTipsQueryResponse'
    }),
    graphql<Props>(gql(queries.safetyTipsTotalCount), {
      name: 'totalCountQueryResponse'
    }),
    graphql<Props>(gql(mutations.removeSafetyTips), {
      name: 'removeMutationResponse',
      options: () => ({
        refetchQueries: refetchQueries()
      })
    })
  )(List)
);
