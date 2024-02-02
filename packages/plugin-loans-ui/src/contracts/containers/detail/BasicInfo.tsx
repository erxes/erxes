import { gql } from '@apollo/client';
import Alert from '@erxes/ui/src/utils/Alert';
import { mutations } from '../../graphql';
import BasicInfoSection from '../../components/common/BasicInfoSection';
import React from 'react';
// import { withRouter } from 'react-router-dom';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import { IContract, RemoveMutationResponse } from '../../types';
import { useMutation } from '@apollo/client';
// import { withRouter } from 'react-router-dom';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils/core';

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
        history.push('/erxes-plugin-loan/contract-list');
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
