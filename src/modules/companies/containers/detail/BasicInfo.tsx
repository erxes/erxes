import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { BasicInfo } from 'modules/companies/components';
import { mutations } from 'modules/companies/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IUser } from '../../../auth/types';
import { IRouterProps } from '../../../common/types';
import { ICompany } from '../../types';

interface IProps extends IRouterProps {
  companiesRemove: (
    params: { variables: { companyIds: string[] } }
  ) => Promise<any>;
  companiesMerge: (
    params: { variables: { companyIds: string[]; companyFields: any } }
  ) => Promise<any>;
  company: ICompany;
  currentUser: IUser;
}

const BasicInfoContainer = (props: IProps) => {
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
)(withRouter<IProps>(BasicInfoContainer));
