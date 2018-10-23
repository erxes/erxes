import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { BasicInfo } from 'modules/companies/components';
import { mutations } from 'modules/companies/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IUser } from '../../../auth/types';
import { IRouterProps } from '../../../common/types';
import { ICompany } from '../../types';

type RemoveMutationVariables = {
  companyIds: string[];
};

type RemoveMutationResponse = {
  companiesRemove: (
    params: { variables: RemoveMutationVariables }
  ) => Promise<any>;
};

type MergeMutationVariables = {
  companyIds: string[];
  companyFields: any;
};

type MergeMutationResponse = {
  companiesMerge: (
    params: { variables: MergeMutationVariables }
  ) => Promise<any>;
};

interface IProps {
  company: ICompany;
}

type FinalProps = { currentUser: IUser } & IProps &
  IRouterProps &
  RemoveMutationResponse &
  MergeMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
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

export default withProps<IProps>(
  compose(
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.companiesRemove),
      {
        name: 'companiesRemove',
        options: generateOptions
      }
    ),
    graphql<{}, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.companiesMerge),
      {
        name: 'companiesMerge',
        options: generateOptions
      }
    )
  )(withRouter<FinalProps>(BasicInfoContainer))
);
