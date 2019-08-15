import gql from 'graphql-tag';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { Alert, renderWithProps } from 'modules/common/utils';
import { mutations } from 'modules/conformity/graphql';
import {
  CreateConformityMutation,
  IConformityCreate
} from 'modules/conformity/types';
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
  createConformityMutation: CreateConformityMutation;
  currentUser: IUser;
} & IProps;

class CompanyDetailsContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.createConformity = this.createConformity.bind(this);
  }

  createConformity = (relType: string, relTypeIds: string[]) => {
    const { id, createConformityMutation } = this.props;

    createConformityMutation({
      variables: {
        mainType: 'company',
        mainTypeId: id,
        relType,
        relTypeIds
      }
    })
      .then(() => {
        Alert.success('success changed customers');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

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
      createConformity: this.createConformity,
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
      ),
      graphql<IProps, CreateConformityMutation, IConformityCreate>(
        gql(mutations.conformityCreate),
        {
          name: 'createConformityMutation',
          options: ({ id }: { id: string }) => ({
            refetchQueries: [
              {
                query: gql(queries.companyDetail),
                variables: { _id: id }
              }
            ]
          })
        }
      )
    )(CompanyDetailsContainer)
  );
};
