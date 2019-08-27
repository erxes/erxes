import gql from 'graphql-tag';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import CompanyDetails from '../../components/detail/CompanyDetails';
import { queries } from '../../graphql';
import { DetailQueryResponse } from '../../types';

type IProps = {
  id: string;
};

type FinalProps = {
  companyDetailQuery: DetailQueryResponse;
  currentUser: IUser;
} & IProps;

class CompanyDetailsContainer extends React.Component<FinalProps> {
  render() {
    const { id, companyDetailQuery, currentUser } = this.props;

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
      ...this.props,
      loading: companyDetailQuery.loading,
      company: companyDetail,
      taggerRefetchQueries,
      currentUser
    };

    return <CompanyDetails {...updatedProps} />;
  }
}

export default (props: IProps) => {
  return renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, DetailQueryResponse, { _id: string }>(
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
};
