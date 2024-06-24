import * as compose from 'lodash.flowright';

import {
  TicketCommentAddMutationResponse,
  TicketCommentAddMutationVariables
} from '../types';

import Form from '@erxes/ui-internalnotes/src/components/Form';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../graphql';

type Props = {
  contentType: string;
  contentTypeId: string;
};

type FinalProps = Props & TicketCommentAddMutationResponse;

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
    const { contentTypeId, ticketCommentAdd } = this.props;

    this.setState({ isLoading: true });

    ticketCommentAdd({
      variables: {
        ticketId: contentTypeId,
        ...variables
      }
    }).then(() => {
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
  graphql<
    Props,
    TicketCommentAddMutationResponse,
    TicketCommentAddMutationVariables
  >(gql(mutations.createTicketComment), {
    name: 'ticketCommentAdd',
    options: () => {
      return {
        refetchQueries: ['activityLogs']
      };
    }
  })
)(FormContainer);
