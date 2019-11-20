import gql from 'graphql-tag';
import InternalNote from 'modules/activityLogs/components/items/InternalNote';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/internalNotes/graphql';
import {
  InternalNoteDetailQueryResponse,
  InternalNotesEditMutationResponse,
  InternalNotesRemoveMutationResponse
} from 'modules/internalNotes/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  activity: any;
  noteId: string;
};

type FinalProps = {
  internalNoteDetailsQuery: InternalNoteDetailQueryResponse;
} & Props;

class InternalNoteContainer extends React.Component<FinalProps> {
  render() {
    const { internalNoteDetailsQuery } = this.props;

    if (internalNoteDetailsQuery.loading) {
      return <Spinner />;
    }

    const internalNote = internalNoteDetailsQuery.internalNoteDetail;

    const updatedProps = {
      ...this.props,
      internalNote
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
    graphql<Props, InternalNotesRemoveMutationResponse, { _id: string }>(
      gql(mutations.internalNotesRemove),
      { name: 'removeMutation' }
    )
  )(InternalNoteContainer)
);
