import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import { CompanyDetails } from '../../components';
import { queries } from '../../graphql';

type Props = {
  id: string;
  companyDetailQuery?: any;
  companyActivityLogQuery?: any;
  currentUser: IUser;
};

const CompanyDetailsContainer = (props: Props) => {
  const { id, companyDetailQuery, companyActivityLogQuery, currentUser } = props;

  if (companyDetailQuery.loading) {
    return <Spinner />;
  }

  const companyDetail = companyDetailQuery.companyDetail;

  const taggerRefetchQueries = [
    {
      query: gql(queries.companyDetail),
      variables: { _id: id }
    }
  ];

  const updatedProps = {
    ...props,
    loadingLogs: companyActivityLogQuery.loading,
    company: companyDetail,
    companyActivityLog: companyActivityLogQuery.activityLogsCompany || [],
    taggerRefetchQueries,
    currentUser,
  };

  return <CompanyDetails {...updatedProps} />;
};


export default compose(
  graphql(gql(queries.companyDetail), {
    name: 'companyDetailQuery',
    options: ({ id }: { id: string }) => ({
      variables: {
        _id: id
      }
    })
  }),
  graphql(gql(queries.activityLogsCompany), {
    name: 'companyActivityLogQuery',
    options: ({ id }: { id: string }) => ({
      variables: {
        _id: id
      }
    })
  })
)(CompanyDetailsContainer);
