import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  ICompany,
  MergeMutationResponse,
  MergeMutationVariables,
  RemoveMutationResponse,
  RemoveMutationVariables,
} from '../../types';
import { mutations, queries } from '../../graphql';

import ActionSection from '@erxes/ui-contacts/src/customers/components/common/ActionSection';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { useNavigate } from 'react-router-dom';

type Props = {
  company: ICompany;
};

type FinalProps = { currentUser: IUser } & Props &
  RemoveMutationResponse &
  MergeMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const navigate = useNavigate();
  const { company, companiesRemove, companiesMerge } = props;

  const { _id } = company;

  const remove = () => {
    companiesRemove({ variables: { companyIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a company');
        navigate('/companies');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const merge = ({ ids, data }) => {
    companiesMerge({
      variables: {
        companyIds: ids,
        companyFields: data,
      },
    })
      .then((response) => {
        Alert.success('You successfully merged companies');
        navigate(`/companies/details/${response.data.companiesMerge._id}`);
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const searchCompany = (
    searchValue: string,
    callback: (data?: any) => void,
  ) => {
    client
      .query({
        query: gql(queries.companies),
        variables: { searchValue, page: 1, perPage: 10 },
      })
      .then((response: any): void => {
        if (typeof callback === 'function') {
          callback(response.data.companies);
        }
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    coc: company,
    cocType: 'company',
    remove,
    merge,
    search: searchCompany,
  };

  return <ActionSection {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['companiesMain', 'companyCounts'],
});

export default withProps<Props>(
  compose(
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.companiesRemove),
      {
        name: 'companiesRemove',
        options: generateOptions,
      },
    ),
    graphql<{}, MergeMutationResponse, MergeMutationVariables>(
      gql(mutations.companiesMerge),
      {
        name: 'companiesMerge',
        options: generateOptions,
      },
    ),
  )(BasicInfoContainer),
);
