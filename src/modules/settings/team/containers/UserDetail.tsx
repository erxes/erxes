import gql from 'graphql-tag';
import { IUserDoc } from 'modules/auth/types';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { UserDetailForm, UserForm } from '.';
import { mutations, queries } from '../graphql';
import { EditMutationResponse } from '../types';

type Props = {
  _id: string;
  queryParams: any;
};

type FinalProps = Props & EditMutationResponse;

const UserDetailContainer = (props: FinalProps) => {
  const { _id, queryParams, usersEdit } = props;

  const save = ({ doc }: { doc: IUserDoc }, closeModal: () => void) => {
    usersEdit({ variables: { _id, ...doc } })
      .then(() => {
        Alert.success('You successfully updated an user');
        closeModal();
      })
      .catch((e: Error) => {
        Alert.error(e.message);
        closeModal();
      });
  };

  const editForm = ({ closeModal, user }) => (
    <UserForm object={user} closeModal={closeModal} save={save} />
  );

  return (
    <UserDetailForm
      _id={_id}
      queryParams={queryParams}
      renderEditForm={editForm}
    />
  );
};

export default withProps<Props>(
  compose(
    graphql<Props, EditMutationResponse, IUserDoc & { _id: string }>(
      gql(mutations.usersEdit),
      {
        name: 'usersEdit',
        options: ({ _id }) => ({
          refetchQueries: [
            { query: gql(queries.userDetail), variables: { _id } },
            { query: gql(queries.channels), variables: { memberIds: [_id] } }
          ]
        })
      }
    )
  )(UserDetailContainer)
);
