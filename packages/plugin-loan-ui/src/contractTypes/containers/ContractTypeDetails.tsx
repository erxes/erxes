import { Alert, EmptyState, Spinner, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import ContractTypeDetails from '../components/ContractTypeDetails';
import { mutations, queries } from '../graphql';
import {
  DetailQueryResponse,
  EditMutationResponse,
  IContractType,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  id: string;
};

type FinalProps = {
  contractTypeDetailQuery: DetailQueryResponse;
  currentUser: IUser;
} & Props &
  IRouterProps &
  EditMutationResponse &
  RemoveMutationResponse;

const ContractTypeDetailsContainer = (props: FinalProps) => {
  const { contractTypeDetailQuery, currentUser, history } = props;

  const saveItem = (doc: IContractType, callback: (item) => void) => {
    const { contractTypesEdit } = props;

    contractTypesEdit({ variables: { ...doc } })
      .then(({ data }) => {
        if (callback) {
          callback(data.contractTypesEdit);
        }
        Alert.success('You successfully updated contract type');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const remove = () => {
    const { id, contractTypesRemove, history } = props;

    contractTypesRemove({ variables: { contractTypeIds: [id] } })
      .then(() => {
        Alert.success('You successfully deleted a contract');
        history.push('/contract-types');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (contractTypeDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!contractTypeDetailQuery.contractTypeDetail) {
    return (
      <EmptyState text="Contract not found" image="/images/actions/24.svg" />
    );
  }

  const contractTypeDetail = contractTypeDetailQuery.contractTypeDetail;

  const updatedProps = {
    ...props,
    loading: contractTypeDetailQuery.loading,
    contractType: contractTypeDetail,
    currentUser,
    saveItem,
    remove
  };

  return <ContractTypeDetails {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['contractTypeDetail']
});
const removeOptions = () => ({
  refetchQueries: ['contractTypesMain']
});

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.contractTypeDetail),
      {
        name: 'contractTypeDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{}, EditMutationResponse, IContractType>(
      gql(mutations.contractTypesEdit),
      {
        name: 'contractTypesEdit',
        options: generateOptions
      }
    ),
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.contractTypesRemove),
      {
        name: 'contractTypesRemove',
        options: removeOptions
      }
    )
  )(withRouter<FinalProps>(ContractTypeDetailsContainer))
);
