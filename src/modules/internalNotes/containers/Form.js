import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Form } from '../components';
import { mutations } from '../graphql';
import { queries } from 'modules/activityLogs/graphql';

const FormContainer = props => {
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

FormContainer.propTypes = {
  contentType: PropTypes.string,
  contentTypeId: PropTypes.string,
  internalNotesAdd: PropTypes.func
};

export default compose(
  graphql(gql(mutations.internalNotesAdd), {
    name: 'internalNotesAdd',
    options: props => {
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
