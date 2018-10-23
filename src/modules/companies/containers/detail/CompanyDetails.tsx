import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IActivityLogForMonth } from '../../../activityLogs/types';
import { IUser } from '../../../auth/types';
import { CompanyDetails } from '../../components';
import { queries } from '../../graphql';
import { ICompany } from '../../types';

type DetailQueryResponse = {
  companyDetail: ICompany;
};

type ActivityLogQueryResponse = {
  activityLogsCompany: IActivityLogForMonth[];
  loading: boolean;
};

type Props = {
  id: string;
};

type FinalProps = {
  companyDetailQuery?: any;
  companyActivityLogQuery?: any;
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
    companyActivityLog: companyActivityLogQuery.activityLogsCompany || [],
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
        options: ({ id }: { id: string }) => ({
          variables: {
            _id: id
          }
        })
      }
    ),
    graphql<Props, ActivityLogQueryResponse, { _id: string }>(
      gql(queries.activityLogsCompany),
      {
        name: 'companyActivityLogQuery',
        options: ({ id }: { id: string }) => ({
          variables: {
            _id: id
          }
        })
      }
    )
  )(CompanyDetailsContainer)
);
