import client from 'apolloClient';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { queries as userQueries } from 'modules/settings/team/graphql';
import { UsersQueryResponse } from 'modules/settings/team/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../settings/brands/types';
import { ConversationReport } from '../components';
import { queries } from '../graphql';
import {
  ConversationSummaryDataQueryResponse,
  ExportArgs,
  IQueryParams
} from '../types';

type Props = {
  history: any;
  brandsQuery: BrandsQueryResponse;
  usersQuery: UsersQueryResponse;
  queryParams: IQueryParams;
  insightsConversationSummaryQuery: ConversationSummaryDataQueryResponse;
};

class ConversationReportContainer extends React.Component<Props> {
  render() {
    const {
      history,
      brandsQuery,
      queryParams,
      usersQuery,
      insightsConversationSummaryQuery
    } = this.props;

    const conversationReport = (args: ExportArgs) => {
      const { queryName, type, userId } = args;
      client
        .query({
          query: gql(queries[queryName]),
          variables: { ...queryParams, type, userId }
        })
        .then(({ data }: any) => {
          window.open(data[queryName], '_blank');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const extendedProps = {
      history,
      queryParams,
      brands: brandsQuery.brands || [],
      users: usersQuery.users || [],
      conversationReport,
      summaryData:
        insightsConversationSummaryQuery.insightsConversationSummary || []
    };

    return <ConversationReport {...extendedProps} />;
  }
}

export default compose(
  graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
    name: 'brandsQuery'
  }),
  graphql<Props, UsersQueryResponse>(gql(userQueries.users), {
    name: 'usersQuery'
  }),
  graphql<Props, ConversationSummaryDataQueryResponse>(
    gql(queries.insightsConversationSummary),
    {
      name: 'insightsConversationSummaryQuery'
    }
  )
)(ConversationReportContainer);
