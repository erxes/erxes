import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '../../../common/types';
import ActionSection from '../components/detail/ActionSection';
import { IUser } from 'modules/auth/types';
import { mutations, queries } from '../graphql';

type Props = {
  user: IUser;
  isSmall?: boolean;
  renderEditForm: ({
    closeModal,
    user
  }: {
    closeModal: () => void;
    user: IUser;
  }) => React.ReactNode;
};

type FinalProps = Props & { statusChangedMutation: any } & IRouterProps;

const ActionSectionContainer = (props: FinalProps) => {
  const { user, renderEditForm, isSmall } = props;

  const changeStatus = (id: string): void => {
    const { statusChangedMutation } = props;

    statusChangedMutation({
      variables: { _id: id }
    })
      .then(() => {
        Alert.success('Congrats, Successfully updated.');
      })
      .catch((error: Error) => {
        Alert.error(error.message);
      });
  };

  const resendInvitation = (email: string) => {
    client
      .mutate({
        mutation: gql(mutations.usersResendInvitation),
        variables: { email }
      })
      .then(() => {
        Alert.success('Successfully resent the invitation');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    user,
    isSmall,
    renderEditForm,
    changeStatus,
    resendInvitation
  };

  return <ActionSection {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }>(gql(mutations.usersSetActiveStatus), {
      name: 'statusChangedMutation',
      options: ({ queryParams }) => ({
        refetchQueries: [
          {
            query: gql(queries.users)
          }
        ]
      })
    })
  )(withRouter<FinalProps>(ActionSectionContainer))
);
