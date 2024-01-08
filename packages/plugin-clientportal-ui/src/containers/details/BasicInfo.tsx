import { Alert } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import React from 'react';
import { withRouter } from 'react-router-dom';

import BasicInfoSection from '../../components/detail/BasicInfoSection';
import { mutations } from '../../graphql';
import {
  ClientPortalUserRemoveMutationResponse,
  IClientPortalUser
} from '../../types';
import { useMutation } from '@apollo/client';

type Props = {
  clientPortalUser: IClientPortalUser;
};

type FinalProps = { currentUser: IUser } & Props &
  IRouterProps &
  ClientPortalUserRemoveMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { clientPortalUser, history } = props;

  const [clientPortalUsersRemove] = useMutation<
    ClientPortalUserRemoveMutationResponse
  >(gql(mutations.clientPortalUsersRemove), {
    refetchQueries: ['clientPortalUserCounts', 'clientPortalUsers']
  });

  const { _id } = clientPortalUser;

  const remove = () => {
    clientPortalUsersRemove({ variables: { clientPortalUserIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a client portal user');
        history.push('/settings/client-portal/user');
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

export default withRouter<FinalProps>(BasicInfoContainer);
