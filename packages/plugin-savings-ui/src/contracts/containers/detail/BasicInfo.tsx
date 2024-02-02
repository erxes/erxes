import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src';
import {
  IContract,
  RemoveMutationResponse,
  RemoveMutationVariables,
} from '../../types';

import BasicInfoSection from '../../components/common/BasicInfoSection';
import { IRouterProps } from '@erxes/ui/src/types';
// import { withRouter } from 'react-router-dom';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { gql, useMutation } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../../graphql';

type Props = {
  contract: IContract;
};

type FinalProps = { currentUser: IUser } & Props & IRouterProps;

const BasicInfoContainer = (props: FinalProps) => {
  const { contract, history, currentUser } = props;

  const [contractsRemove] = useMutation<RemoveMutationResponse>(
    gql(mutations.contractsRemove),
    {
      refetchQueries: [
        'contractsMain',
        'contractCounts',
        'contractCategoriesCount',
      ],
    },
  );

  const { _id } = contract;

  const remove = () => {
    contractsRemove({ variables: { contractIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a contract');
        history.push('/erxes-plugin-saving/contract-list');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
  };

  return <BasicInfoSection {...updatedProps} />;
};

export default BasicInfoContainer;
// export default withRouter<FinalProps>(BasicInfoContainer);
