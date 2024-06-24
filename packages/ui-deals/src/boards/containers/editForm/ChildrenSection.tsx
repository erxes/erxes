import React from 'react';
import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries as dealQueries } from '../../../deals/graphql';
import { queries as taskQueries } from '../../../tasks/graphql';
import { queries as purchaseQueries } from '../../../purchases/graphql';
import { queries as ticketQueries } from '../../../tickets/graphql';
import { withProps } from '@erxes/ui/src/utils';
import { IOptions } from '../../types';
import { IQueryParams } from '@erxes/ui/src/types';
import { getFilterParams } from '../../utils';
import { DealsQueryResponse } from '../../../deals/types';
import { PurchasesQueryResponse } from '../../../purchases/types';
import { TasksQueryResponse } from '../../../tasks/types';
import { TicketsQueryResponse } from '../../../tickets/types';
import ChildrenSectionComponent from '../../components/editForm/ChildrenSection';

type Props = {
  type: string;
  parentId?: string;
  itemId: string;
  stageId: string;
  queryParams: IQueryParams;
  options: IOptions;
  pipelineId: string;
};

type FinalProps = {
  dealQueries: DealsQueryResponse;
  purchaseQueries: PurchasesQueryResponse;
  taskQueries: TasksQueryResponse;
  ticketQueries: TicketsQueryResponse;
} & Props;

class ChildrenSection extends React.Component<FinalProps> {
  render() {
    const {
      type,
      dealQueries,
      purchaseQueries,
      taskQueries,
      ticketQueries,
      parentId,
      options
    } = this.props;

    let children: any[] = [];
    let refetch;

    if (type === 'deal') {
      children = dealQueries.deals;
      refetch = dealQueries.refetch;
    }
    if (type === 'purchase') {
      children = purchaseQueries.purchases;
      refetch = purchaseQueries.refetch;
    }
    if (type === 'task') {
      children = taskQueries.tasks;
      refetch = taskQueries.refetch;
    }
    if (type === 'ticket') {
      children = ticketQueries.tickets;
      refetch = ticketQueries.refetch;
    }

    const updatedProps = {
      ...this.props,
      children,
      parentId: parentId || '',
      options,
      refetch
    };

    return <ChildrenSectionComponent {...updatedProps} />;
  }
}

const commonFilter = ({
  itemId,
  queryParams,
  options
}: {
  itemId: string;
  queryParams: IQueryParams;
  options: IOptions;
}) => ({
  variables: {
    parentId: itemId,
    ...getFilterParams(queryParams, options.getExtraParams),
    hasStartAndCloseDate: false
  }
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(dealQueries.deals), {
      name: 'dealQueries',
      skip: ({ type }) => type !== 'deal',
      options: props => commonFilter(props)
    }),
    graphql<Props>(gql(taskQueries.tasks), {
      name: 'taskQueries',
      skip: ({ type }) => type !== 'task',
      options: props => commonFilter(props)
    }),
    graphql<Props>(gql(ticketQueries.tickets), {
      name: 'ticketQueries',
      skip: ({ type }) => type !== 'ticket',
      options: props => commonFilter(props)
    }),
    graphql<Props>(gql(purchaseQueries.purchases), {
      name: 'purchaseQueries',
      skip: ({ type }) => type !== 'purchase',
      options: props => commonFilter(props)
    })
  )(ChildrenSection)
);
