import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import CompanyDetails from '../../components/detail/CompanyDetails';
import { queries } from '../../graphql';
import { DetailQueryResponse } from '../../types';

type Props = {
  id: string;
};

type FinalProps = {
  companyDetailQuery: DetailQueryResponse;
  currentUser: IUser;
} & Props;

const CompanyDetailsContainer = (props: FinalProps) => {
  const { id, companyDetailQuery, currentUser } = props;

  if (companyDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!companyDetailQuery.companyDetail) {
    return (
      <EmptyState text="Company not found" image="/images/actions/24.svg" />
    );
  }

  const companyDetail = companyDetailQuery.companyDetail || {};

  const taggerRefetchQueries = [
    {
      query: gql(queries.companyDetail),
      variables: { _id: id }
    }
  ];

  const updatedProps = {
    ...props,
    loading: companyDetailQuery.loading,
    company: companyDetail,
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
    )
  )(CompanyDetailsContainer)
);
