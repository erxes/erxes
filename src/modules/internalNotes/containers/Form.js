import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Form } from '../components';
import { mutations, queries } from '../graphql';

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
  internalNotesAdd: PropTypes.func,
  refetch: PropTypes.func
};

export default compose(
  graphql(gql(mutations.internalNotesAdd), {
    name: 'internalNotesAdd',
    options: props => ({
      refetchQueries: [
        {
          query: gql`${queries.customerActivitylogquery}`,
          variables: {
            _id: props.contentTypeId
          }
        }
      ]
    })
  })
)(FormContainer);
