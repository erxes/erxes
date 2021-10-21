import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Histories from '../components/histories/Histories';
import { queries } from '../graphql';
import {
  AutomationHistoriesQueryResponse,
  IAutomation,
  RemoveMutationResponse
} from '../types';

type Props = {
  automation: IAutomation;
  filterParams: {
    page?: number;
    perPage?: number;
    status?: string;
    triggerId?: string;
    triggerType?: string;
    beginDate?: Date;
    endDate?: Date;
  };
};

type FinalProps = {
  automationHistoriesQuery: AutomationHistoriesQueryResponse;
} & Props &
  RemoveMutationResponse;

function HistoriesContainer(props: FinalProps) {
  const { automationHistoriesQuery } = props;

  if (automationHistoriesQuery.loading) {
    return null;
  }

  const histories = automationHistoriesQuery.automationHistories || [];

  return <Histories histories={histories} />;
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.automationHistories), {
      name: 'automationHistoriesQuery',
      options: ({ automation, filterParams }) => ({
        variables: {
          automationId: automation._id,
          ...filterParams
        },
        fetchPolicy: 'network-only'
      })
    })
  )(HistoriesContainer)
);
