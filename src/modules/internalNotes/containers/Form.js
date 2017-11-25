import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Form } from '../components';
import { mutations } from '../graphql';

const FormContainer = props => {
  const { contentType, contentTypeId, internalNotesAdd, refetch } = props;

  // create internalNote
  const create = content => {
    internalNotesAdd({
      variables: {
        contentType,
        contentTypeId,
        content
      }
    }).then(() => {
      if (refetch) refetch();
    });
  };

  return <Form create={create} />;
};

FormContainer.propTypes = {
  contentType: PropTypes.string,
  contentTypeId: PropTypes.string,
  internalNotesAdd: PropTypes.func,
  refetch: PropTypes.func
};

export default compose(
  graphql(gql(mutations.internalNotesAdd), {
    name: 'internalNotesAdd'
  })
)(FormContainer);
