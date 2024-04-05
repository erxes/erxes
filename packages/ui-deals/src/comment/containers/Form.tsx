import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import Form from '@erxes/ui-internalnotes/src/components/Form';
import { mutations, queries } from '../graphql';
import {
  CommentAddMutationResponse,
  CommentAddMutationVariables,
  ClientPortalCommentQueryResponse
} from '../types';

type Props = {
  contentType: string;
  contentTypeId: string;
};

type FinalProps = {
  clientPortalCommentsQueries: ClientPortalCommentQueryResponse;
} & Props &
  CommentAddMutationResponse;

class FormContainer extends React.Component<
  FinalProps,
  { isLoading: boolean }
> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { isLoading: false };
  }

  create = (variables, callback: () => void) => {
    const {
      contentType,
      contentTypeId,
      commentAdd,
      clientPortalCommentsQueries
    } = this.props;

    this.setState({ isLoading: true });

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
  graphql<Props>(gql(queries.clientPortalComments), {
    name: 'clientPortalCommentsQueries',
    options: ({ contentType, contentTypeId }) => ({
      variables: { type: contentType.slice(6), typeId: contentTypeId }
    })
  }),
  graphql<Props, CommentAddMutationResponse, CommentAddMutationVariables>(
    gql(mutations.clientPortalCommentsAdd),
    {
      name: 'commentAdd'
    }
  )
)(FormContainer);
