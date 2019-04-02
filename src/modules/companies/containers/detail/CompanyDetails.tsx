import gql from 'graphql-tag';
import { queries as activityLogQueries } from 'modules/activityLogs/graphql';
import { withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { CompanyDetails } from '../../components';
import { queries } from '../../graphql';
import { ActivityLogQueryResponse, DetailQueryResponse } from '../../types';

type Props = {
  id: string;
  history: any;
  queryParams: any;
};

type FinalProps = {
  companyDetailQuery: DetailQueryResponse;
  companyActivityLogQuery: ActivityLogQueryResponse;
  currentUser: IUser;
} & Props;

const CompanyDetailsContainer = (props: FinalProps) => {
  const {
    id,
    companyDetailQuery,
    companyActivityLogQuery,
    currentUser
  } = props;

  const companyDetail = companyDetailQuery.companyDetail || {};

  const taggerRefetchQueries = [
    {
      query: gql(queries.companyDetail),
      variables: { _id: id }
    }
  ];

  const updatedProps = {
    ...props,
    loadingLogs: companyActivityLogQuery.loading,
    loading: companyDetailQuery.loading,
    company: companyDetail,
    companyActivityLog: companyActivityLogQuery.activityLogs || [],
    taggerRefetchQueries,
    currentUser
  };

  return <CompanyDetails {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.companyDetail),
      {
        name: 'companyDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    ),
    graphql<Props, ActivityLogQueryResponse>(
      gql(activityLogQueries.activityLogs),
      {
        name: 'companyActivityLogQuery',
        options: (props: Props) => ({
          variables: {
            contentId: props.id,
            contentType: 'company',
            activityType: props.queryParams.activityType
          }
        })
      }
    )
  )(CompanyDetailsContainer)
);
