import { ButtonMutate, AppConsumer, withProps } from '@erxes/ui/src';
import {
  IButtonMutateProps,
  IQueryParams,
  IRouterProps
} from '@erxes/ui/src/types';
import React from 'react';
import { graphql } from 'react-apollo';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IUser } from '@erxes/ui/src/auth/types';
import ClientPortalUserFrom from '../components/forms/ClientPortalUserFrom';
import { queries, mutations } from '../graphql';
import { ClientPortalConfigsQueryResponse, IClientPortalUser } from '../types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';

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

class ClientPortalUserFromContainer extends React.Component<FinalProps> {
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

      const afterSave = data => {
        closeModal();
      };

      return (
        <ButtonMutate
          mutation={
            object
              ? mutations.clientPortalUsersEdit
              : mutations.clientPortalUsersAdd
          }
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
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
          <ClientPortalUserFrom
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
  )(ClientPortalUserFromContainer)
);
