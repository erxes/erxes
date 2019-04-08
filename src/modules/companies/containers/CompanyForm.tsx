import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../auth/types';
import { UsersQueryResponse } from '../../settings/team/types';
import { CompanyForm } from '../components';
import { mutations } from '../graphql';
import {
  AddMutationResponse,
  EditMutationResponse,
  ICompany,
  ICompanyDoc
} from '../types';

type Props = {
  company: ICompany;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
} & Props &
  EditMutationResponse &
  AddMutationResponse;

const CompanyFromContainer = (props: FinalProps) => {
  const { companiesEdit, company, companiesAdd } = props;

  let action = ({ doc }) => {
    companiesAdd({ variables: doc })
      .then(() => {
        Alert.success('You successfully added a company');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (company) {
    action = ({ doc }) => {
      companiesEdit({ variables: { _id: company._id, ...doc } })
        .then(() => {
          Alert.success('You successfully updated a company');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };
  }

  const updatedProps = {
    ...props,
    action
  };

  return <CompanyForm {...updatedProps} />;
};

const options = () => ({
  refetchQueries: [
    'companiesMain',
    'companyDetail',
    // companies for customer detail company associate
    'companies',
    'companyCounts'
  ]
});

export default withProps<Props>(
  compose(
    graphql<{}, EditMutationResponse, ICompany>(gql(mutations.companiesEdit), {
      name: 'companiesEdit',
      options
    }),
    graphql<{}, AddMutationResponse, ICompanyDoc>(gql(mutations.companiesAdd), {
      name: 'companiesAdd',
      options
    })
  )(CompanyFromContainer)
);
