import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { List } from '../components';
import { queries, mutations } from '../graphql';

const ListContainer = props => {
  const { internalNotesQuery, internalNotesRemove } = props;

  if (internalNotesQuery.loading) {
    return false;
  }

  // delete internalNote
  const remove = _id => {
    // TODO confirm
    internalNotesRemove({
      variables: { _id }
    }).then(() => internalNotesQuery.refetch());
  };

  const updatedProps = {
    ...props,
    remove,
    notes: internalNotesQuery.internalNotes
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  contentType: PropTypes.string,
  contentTypeId: PropTypes.string,
  internalNotesQuery: PropTypes.object,
  internalNotesAdd: PropTypes.func,
  internalNotesRemove: PropTypes.func
};

export default compose(
  graphql(gql(queries.internalNotes), {
    name: 'internalNotesQuery',
    options: ({ contentType, contentTypeId }) => {
      return {
        variables: {
          contentType,
          contentTypeId
        }
      };
    }
  }),
  graphql(gql(mutations.internalNotesRemove), {
    name: 'internalNotesRemove'
  })
)(ListContainer);
