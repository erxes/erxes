import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import { List } from '../components';
import { queries, mutations } from '../graphql';

const ListContainer = props => {
  const { tagsQuery, addMutation, editMutation, removeMutation, type } = props;

  const remove = tag => {
    confirm().then(() => {
      removeMutation({ variables: { ids: [tag._id] } })
        .then(() => {
          Alert.success();
          tagsQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const save = ({ tag, doc, callback }) => {
    let mutation = addMutation;

    if (tag) {
      doc._id = tag._id;
      mutation = editMutation;
    }

    mutation({ variables: doc })
      .then(() => {
        Alert.success('Successfully saved');
        tagsQuery.refetch();
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags || [],
    type,
    remove,
    save
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  type: PropTypes.string,
  tagsQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: ({ type }) => ({
      variables: { type },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.add), { name: 'addMutation' }),
  graphql(gql(mutations.edit), { name: 'editMutation' }),
  graphql(gql(mutations.remove), { name: 'removeMutation' })
)(ListContainer);
