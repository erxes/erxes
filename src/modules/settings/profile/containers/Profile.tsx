import { AppConsumer } from 'appContext';
import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { UserDetailForm } from 'modules/settings/team/containers';
import { mutations, queries } from 'modules/settings/team/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { IUser, IUserDoc } from '../../../auth/types';
import { EditProfileForm } from '../components';

type Props = {
  currentUser: IUser;
  usersEditProfile: (params: { variables: IUserDoc }) => Promise<any>;
  queryParams: any;
};

const Profile = (props: Props) => {
  const { currentUser, usersEditProfile, queryParams } = props;

  const save = (variables: IUserDoc) => {
    usersEditProfile({ variables })
      .then(() => {
        Alert.success('Congrats');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  return (
    <UserDetailForm
      _id={currentUser._id}
      queryParams={queryParams}
      renderEditForm={({ user, closeModal }) => (
        <EditProfileForm
          currentUser={user}
          save={save}
          closeModal={closeModal}
        />
      )}
    />
  );
};

const WithQuery = compose(
  graphql(gql(mutations.usersEditProfile), {
    name: 'usersEditProfile',
    options: ({ currentUser }: { currentUser: IUser }) => ({
      refetchQueries: [
        {
          query: gql(queries.userDetail),
          variables: {
            _id: currentUser._id
          }
        }
      ]
    })
  })
)(Profile);

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ currentUser }) => <WithQuery {...props} currentUser={currentUser} />}
    </AppConsumer>
  );
};

export default WithConsumer;
