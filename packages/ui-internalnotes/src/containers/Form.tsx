import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import Form from '../components/Form';
import { mutations } from '../graphql';
import {
  mutations as commentMutations,
  queries as commentQueries
} from '@erxes/ui-cards/src/comment/graphql';
import {
  InternalNotesAddMutationResponse,
  InternalNotesAddMutationVariables,
  CommentAddMutationResponse,
  CommentAddMutationVariables,
  ClientPortalCommentQueryResponse
} from '../types';

type Props = {
  contentType: string;
  contentTypeId: string;
  inputType?: string;
};

type FinalProps = {
  clientPortalCommentsQueries: ClientPortalCommentQueryResponse;
} & Props &
  InternalNotesAddMutationResponse &
  CommentAddMutationResponse;

class FormContainer extends React.Component<
  FinalProps,
  { isLoading: boolean }
> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { isLoading: false };
  }

  // create internalNote
  create = (variables, callback: () => void) => {
    const {
      contentType,
      contentTypeId,
      internalNotesAdd,
      commentAdd,
      inputType,
      clientPortalCommentsQueries
    } = this.props;

    this.setState({ isLoading: true });

    if (inputType === 'comment') {
      commentAdd({
        variables: {
          type: contentType.slice(6),
          typeId: contentTypeId,
          userType: 'team',
          ...variables
        }
      }).then(() => {
        clientPortalCommentsQueries.refetch();
        callback();

        this.setState({ isLoading: false });
      });
    } else {
      internalNotesAdd({
        variables: {
          contentType,
          contentTypeId,
          ...variables
        }
      }).then(() => {
        callback();

        this.setState({ isLoading: false });
      });
    }
  };

  render() {
    const { contentType, contentTypeId } = this.props;

    return (
      <Form
        save={this.create}
        isActionLoading={this.state.isLoading}
        contentType={contentType}
        contentTypeId={contentTypeId}
      />
    );
  }
}

export default compose(
  graphql<
    Props,
    InternalNotesAddMutationResponse,
    InternalNotesAddMutationVariables
  >(gql(mutations.internalNotesAdd), {
    name: 'internalNotesAdd',
    options: () => {
      return {
        refetchQueries: ['activityLogs']
      };
    }
  }),
  graphql<Props>(gql(commentQueries.clientPortalComments), {
    name: 'clientPortalCommentsQueries',
    options: ({ contentType, contentTypeId }) => ({
      variables: { type: contentType.slice(6), typeId: contentTypeId }
    })
  }),
  graphql<Props, CommentAddMutationResponse, CommentAddMutationVariables>(
    gql(commentMutations.clientPortalCommentsAdd),
    {
      name: 'commentAdd',
      options: () => {
        return {
          refetchQueries: ['activityLogs']
        };
      }
    }
  )
)(FormContainer);
