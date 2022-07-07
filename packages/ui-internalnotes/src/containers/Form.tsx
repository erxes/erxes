import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import Form from '../components/Form';
import { mutations } from '../graphql';
import {
  InternalNotesAddMutationResponse,
  InternalNotesAddMutationVariables
} from '../types';

type Props = {
  contentType: string;
  contentTypeId: string;
};

type FinalProps = Props & InternalNotesAddMutationResponse;

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
    const { contentType, contentTypeId, internalNotesAdd } = this.props;

    this.setState({ isLoading: true });

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
  })
)(FormContainer);
