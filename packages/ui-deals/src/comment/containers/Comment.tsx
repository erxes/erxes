import React from 'react';
import Comment from '../components/Comment';
import { IItem } from '../../boards/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import * as compose from 'lodash.flowright';
import { queries, mutations } from '../graphql/';
import {
  ClientPortalCommentQueryResponse,
  IClientPortalComment,
  CommentRemoveMutationResponse
} from '../types';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';

type Props = {
  item: IItem;
  currentUser?: IUser;
};

type FinalProps = {
  clientPortalCommentsQuery: ClientPortalCommentQueryResponse;
} & Props &
  CommentRemoveMutationResponse;

class CommentContainer extends React.Component<FinalProps> {
  render() {
    const { clientPortalCommentsQuery, removeMutation } = this.props;

    const clientPortalComments =
      clientPortalCommentsQuery.clientPortalComments ||
      ([] as IClientPortalComment[]);

    const remove = (_id: string) => {
      confirm().then(() => {
        removeMutation({ variables: { _id } })
          .then(() => {
            Alert.success('You successfully deleted a comment');
            clientPortalCommentsQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    return (
      <Comment
        currentUser={this.props.currentUser}
        clientPortalComments={clientPortalComments}
        remove={remove}
      />
    );
  }
}

const WithProps = withProps<Props>(
  compose(
    graphql<Props, ClientPortalCommentQueryResponse, {}>(
      gql(queries.clientPortalComments),
      {
        name: 'clientPortalCommentsQuery',
        options: ({ item }: { item: IItem }) => ({
          variables: { typeId: item._id, type: item.stage.type },
          fetchPolicy: 'network-only',
          notifyOnNetworkStatusChange: true
        })
      }
    ),
    graphql<Props, CommentRemoveMutationResponse, {}>(
      gql(mutations.clientPortalCommentsRemove),
      {
        name: 'removeMutation'
      }
    )
  )(CommentContainer)
);

export default withCurrentUser(WithProps);
