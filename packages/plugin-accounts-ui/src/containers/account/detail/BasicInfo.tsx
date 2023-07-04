import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import BasicInfo from '../../../components/account/detail/BasicInfo';
import { IAccount, AccountRemoveMutationResponse } from '../../../types';
import { mutations } from '../../../graphql';

type Props = {
  account: IAccount;
  refetchQueries?: any[];
};

type FinalProps = {
  currentUser: IUser;
} & Props &
  IRouterProps &
  AccountRemoveMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { account, accountsRemove, history } = props;

  const { _id } = account;

  const remove = () => {
    accountsRemove({ variables: { accountIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a account');
        history.push('/settings/account');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    remove
  };

  return <BasicInfo {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['accounts', 'accountCategories', 'accountsTotalCount']
});

export default withProps<Props>(
  compose(
    graphql<{}, AccountRemoveMutationResponse, { accountIds: string[] }>(
      gql(mutations.accountsRemove),
      {
        name: 'accountsRemove',
        options: generateOptions
      }
    )
  )(withRouter<FinalProps>(BasicInfoContainer))
);
