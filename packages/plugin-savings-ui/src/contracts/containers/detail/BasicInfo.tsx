import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src';
import { mutations } from '../../graphql';
import BasicInfoSection from '../../components/common/BasicInfoSection';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  IContract,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../../types';

type Props = {
  contract: IContract;
};

type FinalProps = { currentUser: IUser } & Props &
  IRouterProps &
  RemoveMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { contract, contractsRemove, history, currentUser } = props;

  const { _id } = contract;

  const remove = () => {
    contractsRemove({ variables: { contractIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a contract');
        history.push('/erxes-plugin-saving/contract-list');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove
  };

  return <BasicInfoSection {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['contractsMain', 'contractCounts', 'contractCategoriesCount']
});

export default withProps<Props>(
  compose(
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.contractsRemove),
      {
        name: 'contractsRemove',
        options: generateOptions
      }
    )
  )(withRouter<FinalProps>(BasicInfoContainer))
);
