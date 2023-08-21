import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import {
  InternalNoteDetailQueryResponse,
  InternalNotesEditMutationResponse,
  InternalNotesRemoveMutationResponse
} from '@erxes/ui-internalnotes/src/types';
import { mutations, queries } from '@erxes/ui-internalnotes/src/graphql';

import { IUser } from '@erxes/ui/src/auth/types';
import InternalNote from '../../components/items/InternalNote';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';

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
