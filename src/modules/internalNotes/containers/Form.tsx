import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries } from 'modules/activityLogs/graphql';
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

  render() {
    const { contentType, contentTypeId, internalNotesAdd } = this.props;

    // create internalNote
    const create = (
      content: string,
      mentionedUserIds,
      callback: () => void
    ) => {
      this.setState({ isLoading: true });

      internalNotesAdd({
        variables: {
          contentType,
          contentTypeId,
          mentionedUserIds,
          content
        }
      }).then(() => {
        callback();

        this.setState({ isLoading: false });
      });
    };

    return <Form create={create} isActionLoading={this.state.isLoading} />;
  }
}

export default compose(
  graphql<
    Props,
    InternalNotesAddMutationResponse,
    InternalNotesAddMutationVariables
  >(gql(mutations.internalNotesAdd), {
    name: 'internalNotesAdd',
    options: (props: Props) => {
      return {
        refetchQueries: [
          {
            query: gql(queries[`activityLogs`]),
            variables: {
              contentId: props.contentTypeId,
              contentType: props.contentType
            }
          }
        ]
      };
    }
  })
)(FormContainer);
