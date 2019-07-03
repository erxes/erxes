import gql from 'graphql-tag';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { ConversationReport } from '../components';
import { queries } from '../graphql';
import {
  ConversationCustomerAvgQueryResponse,
  ConversationInternalAvgQueryResponse,
  ConversationOverallAvgQueryResponse,
  ConversationSummaryDataQueryResponse,
  IQueryParams
} from '../types';

type Props = {
  history: any;
  brandsQuery: BrandsQueryResponse;
  queryParams: IQueryParams;
  insightsConversationCustomerAvgQuery: ConversationCustomerAvgQueryResponse;
  insightsConversationInternalAvgQuery: ConversationInternalAvgQueryResponse;
  insightsConversationOverallAvgQuery: ConversationOverallAvgQueryResponse;
  insightsConversationSummaryQuery: ConversationSummaryDataQueryResponse;
};

class ConversationReportContainer extends React.Component<Props> {
  render() {
    const {
      history,
      brandsQuery,
      queryParams,
      insightsConversationCustomerAvgQuery,
      insightsConversationInternalAvgQuery,
      insightsConversationOverallAvgQuery,
      insightsConversationSummaryQuery
    } = this.props;

    const extendedProps = {
      history,
      queryParams,
      brands: brandsQuery.brands || [],
      conversationCustomerAvg:
        insightsConversationCustomerAvgQuery.insightsConversationCustomerAvg ||
        [],
      conversationInternalAvg:
        insightsConversationInternalAvgQuery.insightsConversationInternalAvg ||
        [],
      conversationOverallAvg:
        insightsConversationOverallAvgQuery.insightsConversationOverallAvg ||
        [],
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

const options = ({ queryParams }) => {
  return {
    variables: {
      brandIds: queryParams.brandIds,
      integrationIds: queryParams.integrationIds,
      startDate: queryParams.startDate,
      endDate: queryParams.endDate
    }
  };
};

export default compose(
  graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery'
  }),
  graphql<Props, ConversationCustomerAvgQueryResponse>(
    gql(queries.insightsConversationCustomerAvg),
    {
      name: 'insightsConversationCustomerAvgQuery',
      options
    }
  ),
  graphql<Props, ConversationInternalAvgQueryResponse>(
    gql(queries.insightsConversationInternalAvg),
    {
      name: 'insightsConversationInternalAvgQuery',
      options
    }
  ),
  graphql<Props, ConversationOverallAvgQueryResponse>(
    gql(queries.insightsConversationOverallAvg),
    {
      name: 'insightsConversationOverallAvgQuery',
      options
    }
  ),
  graphql<Props, ConversationSummaryDataQueryResponse>(
    gql(queries.insightsConversationSummary),
    {
      name: 'insightsConversationSummaryQuery',
      options
    }
  )
)(ConversationReportContainer);
