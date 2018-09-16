import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { BasicInfo } from 'modules/companies/components';
import { mutations } from 'modules/companies/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IUser } from '../../../auth/types';
import { ICompany } from '../../types';

type Props = {
  companiesRemove: (params: { variables: { companyIds: string[] } }) => Promise<any>
  companiesMerge: (params: { variables: { companyIds: string[], companyFields: any } }) => Promise<any>,
  history: any,
  location: any
  currentUser: IUser
};

const BasicInfoContainer = (props: BaseProps & Props) => {
  const { company, companiesRemove, companiesMerge, history } = props;

  const { _id } = company;

  const remove = () => {
    companiesRemove({ variables: { companyIds: [_id] } })
      .then(() => {
        Alert.success('Success');
        history.push('/companies');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const merge = ({ ids, data }) => {
    companiesMerge({
      variables: {
        companyIds: ids,
        companyFields: data
      }
    })
      .then(response => {
        Alert.success('Success');
        history.push(`/companies/details/${response.data.companiesMerge._id}`);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
    merge
  };

  return <BasicInfo {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['companieMain', 'companyCounts']
});

type BaseProps = {
  company: ICompany,
  history: any,
  location: any,
  match: any,
};

export default compose(
  // mutations
  graphql(gql(mutations.companiesRemove), {
    name: 'companiesRemove',
    options: generateOptions
  }),
  graphql(gql(mutations.companiesMerge), {
    name: 'companiesMerge',
    options: generateOptions
  })
)(withRouter(BasicInfoContainer));
