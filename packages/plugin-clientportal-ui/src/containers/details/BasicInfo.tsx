import * as compose from 'lodash.flowright';

import { Alert, withProps } from '@erxes/ui/src';
import {
  ClientPortalUserRemoveMutationResponse,
  IClientPortalUser,
} from '../../types';

import BasicInfoSection from '../../components/detail/BasicInfoSection';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../../graphql';
// import { withRouter } from 'react-router-dom';

type Props = {
  clientPortalUser: IClientPortalUser;
};

type FinalProps = { currentUser: IUser } & Props &
  IRouterProps &
  ClientPortalUserRemoveMutationResponse;

const BasicInfoContainer = (props: FinalProps) => {
  const { clientPortalUser, clientPortalUsersRemove, history } = props;

  const { _id } = clientPortalUser;

  const remove = () => {
    clientPortalUsersRemove({ variables: { clientPortalUserIds: [_id] } })
      .then(() => {
        Alert.success('You successfully deleted a client portal user');
        history.push('/settings/client-portal/user');
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

const generateOptions = () => ({
  refetchQueries: ['clientPortalUserCounts', 'clientPortalUsers'],
});

export default withProps<Props>(
  compose(
    graphql<{}, ClientPortalUserRemoveMutationResponse>(
      gql(mutations.clientPortalUsersRemove),
      {
        name: 'clientPortalUsersRemove',
        options: generateOptions,
      },
    ),
  )(BasicInfoContainer),
);
