import gql from 'graphql-tag';
import { IUserDoc } from 'modules/auth/types';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { UserDetailForm, UserForm } from '.';
import { mutations, queries } from '../graphql';

type Props = {
  _id: string;
  queryParams: any;
  usersEdit: (
    params: { variables: { _id: string } & IUserDoc }
  ) => Promise<any>;
};

const UserDetailContainer = (props: Props) => {
  const { _id, queryParams, usersEdit } = props;

  const save = ({ doc }: { doc: IUserDoc }, closeModal: () => void) => {
    usersEdit({ variables: { _id, ...doc } })
      .then(() => {
        Alert.success('Successfully saved');
        closeModal();
      })
      .catch((e: Error) => {
        Alert.error(e.message);
        closeModal();
      });
  };

  return (
    <UserDetailForm
      _id={_id}
      queryParams={queryParams}
      renderEditForm={({ closeModal, user }) => (
        <UserForm object={user} closeModal={closeModal} save={save} />
      )}
    />
  );
};

export default compose(
  graphql(gql(mutations.usersEdit), {
    name: 'usersEdit',
    options: ({ _id }: { _id: string }) => ({
      refetchQueries: [
        { query: gql(queries.userDetail), variables: { _id } },
        { query: gql(queries.channels), variables: { memberIds: [_id] } }
      ]
    })
  })
)(UserDetailContainer);
