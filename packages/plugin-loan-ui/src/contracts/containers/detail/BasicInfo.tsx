import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src';
import { mutations } from '../../graphql';
import BasicInfoSection from '../../components/common/BasicInfoSection';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  ConfirmMutationResponse,
  ConfirmMutationVariables,
  IContract,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../../types';

type Props = {
  contract: IContract;
};

type FinalProps = { currentUser: IUser } & Props &
  IRouterProps &
  RemoveMutationResponse &
  ConfirmMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const {
    contract,
    contractsRemove,
    history,
    contractConfirm,
    currentUser
  } = props;

  const { _id } = contract;

  const remove = () => {
    contractsRemove({ variables: { contractIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a contract');
        history.push('/erxes-plugin-loan/contract-list');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const toConfirm = () => {
    contractConfirm({ variables: { contractId: contract._id } })
      .then(data => {
        if (
          !data ||
          !data.data ||
          !data.data.contractConfirm ||
          !data.data.contractConfirm.result
        ) {
          return <></>;
        }

        const content = data.data.contractConfirm.result.responseMainPay;

        const myWindow =
          window.open('', '_blank', 'width=800, height=800') || ({} as any);

        if ('document' in myWindow && 'write' in myWindow.document) {
          myWindow.document.write(content);
        } else {
          alert('please allow Pop-ups and redirects on site settings!!!');
        }

        return <></>;
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove,
    toConfirm
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
    ),
    graphql<{}, ConfirmMutationResponse, ConfirmMutationVariables>(
      gql(mutations.contractConfirm),
      {
        name: 'contractConfirm'
      }
    )
  )(withRouter<FinalProps>(BasicInfoContainer))
);
