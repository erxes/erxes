import { Alert, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

import BasicInfoSection from '../../components/detail/BasicInfoSection';
import { mutations } from '../../graphql';
import {
  ClientPortalUserRemoveMutationResponse,
  IClientPortalUser
} from '../../types';

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
  refetchQueries: ['clientPortalUserCounts', 'clientPortalUsers']
});

export default withProps<Props>(
  compose(
    graphql<{}, ClientPortalUserRemoveMutationResponse>(
      gql(mutations.clientPortalUsersRemove),
      {
        name: 'clientPortalUsersRemove',
        options: generateOptions
      }
    )
  )(withRouter<FinalProps>(BasicInfoContainer))
);
