import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/companies/graphql';
import ActionSection from 'modules/customers/components/common/ActionSection';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IUser } from '../../../auth/types';
import { IRouterProps } from '../../../common/types';
import {
  ICompany,
  MergeMutationResponse,
  MergeMutationVariables,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../../types';

type Props = {
  company: ICompany;
};

type FinalProps = { currentUser: IUser } & Props &
  IRouterProps &
  RemoveMutationResponse &
  MergeMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { company, companiesRemove, companiesMerge, history } = props;

  const { _id } = company;

  const remove = () => {
    companiesRemove({ variables: { companyIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a company');
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
        Alert.success('You successfully merged companies');
        history.push(`/companies/details/${response.data.companiesMerge._id}`);
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const searchCompany = (
    searchValue: string,
    callback: (data?: any) => void
  ) => {
    client
      .query({
        query: gql(queries.companies),
        variables: { searchValue, page: 1, perPage: 10 }
      })
      .then((response: any): void => {
        if (typeof callback === 'function') {
          callback(response.data.companies);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    coc: company,
    cocType: 'company',
    remove,
    merge,
    search: searchCompany
  };

  return <ActionSection {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['companiesMain', 'companyCounts']
});

export default withProps<Props>(
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
