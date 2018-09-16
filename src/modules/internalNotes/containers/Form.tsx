import gql from 'graphql-tag';
import { queries } from 'modules/activityLogs/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Form } from '../components';
import { mutations } from '../graphql';

type Props = {
  contentType: string,
  contentTypeId: string,
  internalNotesAdd: (params: {
    variables: {
      contentType: string,
      contentTypeId: string,
      content: string
    }
  }) => void
};

const FormContainer = (props: Props) => {
  const { contentType, contentTypeId, internalNotesAdd } = props;

  // create internalNote
  const create = content => {
    internalNotesAdd({
      variables: {
        contentType,
        contentTypeId,
        content
      }
    });
  };

  return <Form create={create} />;
};

export default compose(
  graphql(gql(mutations.internalNotesAdd), {
    name: 'internalNotesAdd',
    options: (props: Props) => {
      return {
        refetchQueries: [
          {
            query: gql(queries[`${props.contentType}ActivityLogQuery`]),
            variables: { _id: props.contentTypeId }
          }
        ]
      };
    }
  })
)(FormContainer);
