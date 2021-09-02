import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Histories from '../components/Histories';
import { queries } from '../graphql';
import { RemoveMutationResponse } from '../types';

type Props = {
  automationId: string;
};

type FinalProps = {
  automationHistoriesQuery: any;
} & Props &
  RemoveMutationResponse;

function HistoriesContainer(props: FinalProps) {
  const { automationHistoriesQuery } = props;

  if (automationHistoriesQuery.loading) {
    return <div>...</div>;
  }

  return (
    <Histories histories={automationHistoriesQuery.automationHistories || []} />
  );
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.automationHistories), {
      name: 'automationHistoriesQuery',
      options: ({ automationId }) => ({
        variables: { automationId },
        fetchPolicy: 'network-only'
      })
    })
  )(HistoriesContainer)
);
