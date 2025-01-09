import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import Histories from '../components/histories/Histories';
import { queries } from '../graphql';
import {
  AutomationHistoriesQueryResponse,
  IAutomation,
  ITrigger,
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
  triggersConst: ITrigger[];
  actionsConst: any[];
};

type FinalProps = {
  automationHistoriesQuery: AutomationHistoriesQueryResponse;
} & Props &
  RemoveMutationResponse;

function HistoriesContainer(props: FinalProps) {
  const { automationHistoriesQuery, triggersConst, actionsConst, automation } =
    props;

  if (automationHistoriesQuery.loading) {
    return null;
  }
  const { automationHistories = [], automationHistoriesTotalCount = 0 } =
    automationHistoriesQuery;

  return (
    <Histories
      automation={automation}
      histories={automationHistories}
      totalCount={automationHistoriesTotalCount}
      triggersConst={triggersConst}
      actionsConst={actionsConst}
    />
  );
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.automationHistories), {
      name: 'automationHistoriesQuery',
      options: ({ automation, filterParams }) => ({
        variables: {
          ...filterParams,
          automationId: automation._id,
          page: filterParams.page
        },
        fetchPolicy: 'network-only'
      })
    })
  )(HistoriesContainer)
);
