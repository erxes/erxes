import { AppConsumer, ButtonMutate, withProps } from '@erxes/ui/src';
import { IUser, UsersQueryResponse } from '@erxes/ui/src/auth/types';
import {
  IButtonMutateProps,
  IQueryParams,
  IRouterProps
} from '@erxes/ui/src/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import ClientPortalUserForm from '../components/forms/ClientPortalUserForm';
import { mutations, queries } from '../graphql';
import { ClientPortalConfigsQueryResponse, IClientPortalUser } from '../types';

type Props = {
  clientPortalUser: IClientPortalUser;
  closeModal: () => void;
  queryParams: IQueryParams;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  clientPortalConfigsQuery: ClientPortalConfigsQueryResponse;
} & Props &
  IRouterProps;

class ClientPortalUserFormContainer extends React.Component<FinalProps> {
  render() {
    const { clientPortalConfigsQuery } = this.props;

    if (clientPortalConfigsQuery.loading) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal } = this.props;

      const cleanValues = obj => {
        const newObj = { ...obj };

        Object.keys(newObj).forEach(key => {
          const val = newObj[key];
          if (val === null || val === undefined || val === '') {
            delete newObj[key];
          }
        });

        return newObj;
      };

      const afterSave = _data => {
        closeModal();
      };

      return (
        <ButtonMutate
          mutation={
            object
              ? mutations.clientPortalUsersEdit
              : mutations.clientPortalUsersInvite
          }
          variables={cleanValues(values)}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        >
          Invite
        </ButtonMutate>
      );
    };

    const clientPortalGetConfigs =
      clientPortalConfigsQuery.clientPortalGetConfigs || [];

    const updatedProps = {
      ...this.props,
      clientPortalGetConfigs,
      renderButton
    };

    return (
      <AppConsumer>
        {({ currentUser }) => (
          <ClientPortalUserForm
            {...updatedProps}
            currentUser={currentUser || ({} as IUser)}
          />
        )}
      </AppConsumer>
    );
  }
}

const getRefetchQueries = () => {
  return ['clientPortalUsers', 'clientPortalUserCounts'];
};

export default withProps<Props>(
  compose(
    graphql<Props, ClientPortalConfigsQueryResponse>(gql(queries.getConfigs), {
      name: 'clientPortalConfigsQuery'
    })
  )(ClientPortalUserFormContainer)
);
