import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser } from '../../auth/types';
import { CompanyForm } from '../components';
import { mutations } from '../graphql';
import { ICompany, ICompanyDoc } from '../types';

type Props = {
  company: ICompany;
  closeModal: () => void;
  companiesEdit: (params: { variables: ICompany }) => Promise<any>;
  companiesAdd: (params: { variables: ICompanyDoc }) => Promise<any>;
  usersQuery: any;
  currentUser: IUser;
};

const CompanyFromContainer = (props: Props) => {
  const { companiesEdit, company, companiesAdd } = props;

  let action = ({ doc }) => {
    companiesAdd({ variables: doc })
      .then(() => {
        Alert.success('Success');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (company) {
    action = ({ doc }) => {
      companiesEdit({ variables: { _id: company._id, ...doc } })
        .then(() => {
          Alert.success('Success');
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

export default compose(
  graphql(gql(mutations.companiesEdit), {
    name: 'companiesEdit',
    options
  }),
  graphql(gql(mutations.companiesAdd), {
    name: 'companiesAdd',
    options
  })
)(CompanyFromContainer);
