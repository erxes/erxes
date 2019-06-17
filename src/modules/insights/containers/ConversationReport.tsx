import gql from 'graphql-tag';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { ConversationReport } from '../components';
import { queries } from '../graphql';
import { ConversationSummaryDataQueryResponse, IQueryParams } from '../types';

type Props = {
  history: any;
  brandsQuery: BrandsQueryResponse;
  queryParams: IQueryParams;
  insightsConversationSummaryQuery: ConversationSummaryDataQueryResponse;
};

class ConversationReportContainer extends React.Component<Props> {
  render() {
    const {
      history,
      brandsQuery,
      queryParams,
      insightsConversationSummaryQuery
    } = this.props;

    const extendedProps = {
      history,
      queryParams,
      brands: brandsQuery.brands || [],
      conversationReport: insightsConversationSummaryQuery.insightsConversationSummary || {
        avg: [],
        trend: [],
        teamMembers: []
      },
      loading: insightsConversationSummaryQuery.loading
    };

    return <ConversationReport {...extendedProps} />;
  }
}

export default compose(
  graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery'
  }),
  graphql<Props, ConversationSummaryDataQueryResponse>(
    gql(queries.insightsConversationSummary),
    {
      name: 'insightsConversationSummaryQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            brandIds: queryParams.brandIds,
            integrationIds: queryParams.integrationIds,
            startDate: queryParams.startDate,
            endDate: queryParams.endDate
          }
        };
      }
    }
  )
)(ConversationReportContainer);
