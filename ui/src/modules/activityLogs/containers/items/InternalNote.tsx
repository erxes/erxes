import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import InternalNote from 'modules/activityLogs/components/items/InternalNote';
import { IUser } from 'modules/auth/types';
import Spinner from 'modules/common/components/Spinner';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/internalNotes/graphql';
import {
  InternalNoteDetailQueryResponse,
  InternalNotesEditMutationResponse,
  InternalNotesRemoveMutationResponse
} from 'modules/internalNotes/types';
import React from 'react';
import { graphql } from 'react-apollo';

type Props = {
  activity: any;
  noteId: string;
  currentUser: IUser;
};

type FinalProps = {
  internalNoteDetailsQuery: InternalNoteDetailQueryResponse;
  editMutation: InternalNotesEditMutationResponse;
} & Props &
  InternalNotesRemoveMutationResponse;

class InternalNoteContainer extends React.Component<
  FinalProps,
  { isLoading: boolean }
> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { isLoading: false };
  }

  render() {
    const {
      internalNoteDetailsQuery,
      noteId,
      editMutation,
      internalNotesRemove
    } = this.props;

    if (internalNoteDetailsQuery.loading) {
      return <Spinner />;
    }

    const internalNote = internalNoteDetailsQuery.internalNoteDetail;

    const edit = (variables, callback) => {
      this.setState({ isLoading: true });

      editMutation({ variables: { _id: noteId, ...variables } })
        .then(() => {
          Alert.success('You successfully updated a note.');

          if (callback) {
            callback();
          }

          this.setState({ isLoading: false });
        })
        .catch(error => {
          Alert.error(error.message);
          this.setState({ isLoading: false });
        });
    };

    const remove = () => {
      confirm().then(() =>
        internalNotesRemove({ variables: { _id: noteId } })
          .then(() => {
            Alert.success('You successfully deleted a note.');
          })
          .catch(error => {
            Alert.error(error.message);
          })
      );
    };

    const updatedProps = {
      ...this.props,
      internalNote,
      edit,
      remove,
      isLoading: this.state.isLoading
    };

    return <InternalNote {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, InternalNoteDetailQueryResponse>(
      gql(queries.internalNoteDetail),
      {
        name: 'internalNoteDetailsQuery',
        options: ({ noteId }) => ({
          variables: {
            _id: noteId
          }
        })
      }
    ),
    graphql<Props, InternalNotesEditMutationResponse>(
      gql(mutations.internalNotesEdit),
      {
        name: 'editMutation'
      }
    ),
    graphql<Props, InternalNotesRemoveMutationResponse>(
      gql(mutations.internalNotesRemove),
      {
        name: 'internalNotesRemove',
        options: () => ({
          refetchQueries: ['activityLogs']
        })
      }
    )
  )(InternalNoteContainer)
);
