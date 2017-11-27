import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Form } from '../components';
import { mutations } from '../graphql';

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
    }).then(() => {
      // if (refetch) refetch();
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

const customerAcitivtylogquery = gql`
  query activityLogsCustomer($_id: String!) {
    activityLogsCustomer(_id: $_id) {
      date {
        year
        month
      }
      list {
        id
        action
        content
        createdAt
        by {
          _id
          type
          details {
            avatar
            fullName
          }
        }
      }
    }
  }
`;

export default compose(
  graphql(gql(mutations.internalNotesAdd), {
    name: 'internalNotesAdd',
    options: props => ({
      refetchQueries: [
        {
          query: customerAcitivtylogquery,
          variables: {
            _id: props.contentTypeId
          }
        }
      ]
    })
  })
)(FormContainer);
