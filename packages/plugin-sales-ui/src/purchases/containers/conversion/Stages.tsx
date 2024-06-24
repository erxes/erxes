import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { queries } from '@erxes/ui-cards/src/boards/graphql';
import { ConversionStagesQueryResponse } from '@erxes/ui-cards/src/boards/types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { withProps } from '@erxes/ui/src/utils';
import List from '../../components/conversion/list/List';
import Table from '../../components/conversion/table/Table';
import * as React from 'react';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  pipelineId: string;
  queryParams: any;
  type: string;
};

type FinalProps = {
  stagesQuery: ConversionStagesQueryResponse;
} & Props;

class PurchaseStagesContainer extends React.Component<FinalProps> {
  render() {
    const { stagesQuery, type, pipelineId } = this.props;

    if (!stagesQuery || !stagesQuery.stages) {
      return (
        <EmptyState
          image="/images/actions/18.svg"
          text="Oh boy, looks like you need to get a head start on your board"
          size="small"
        />
      );
    }

    if (localStorage.getItem('cacheInvalidated') === 'true') {
      stagesQuery.refetch({ pipelineId });
    }

    if (stagesQuery.loading) {
      return <Spinner objective={true} />;
    }

    const stages = stagesQuery.stages || [];

    if (type === 'more') {
      return <Table {...this.props} stages={stages} />;
    }

    return <List stages={stages} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, ConversionStagesQueryResponse>(
      gql(queries.conversionStages),
      {
        name: 'stagesQuery',
        skip: ({ pipelineId }) => !pipelineId,
        options: ({ pipelineId, queryParams }) => ({
          variables: {
            isNotLost: true,
            pipelineId,
            search: queryParams.search,
            customerIds: queryParams.customerIds,
            companyIds: queryParams.companyIds,
            assignedUserIds: queryParams.assignedUserIds,
            productIds: queryParams.productIds,
            closeDateType: queryParams.closeDateType,
            userIds: queryParams.userIds,
            assignedToMe: queryParams.assignedToMe
          }
        })
      }
    )
  )(PurchaseStagesContainer)
);
