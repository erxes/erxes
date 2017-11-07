import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert, confirm } from 'modules/common/utils';
import { List } from '../components';

const ListContainer = props => {
  const { tagsQuery, addMutation, editMutation, removeMutation, type } = props;

  if (tagsQuery.loading) {
    return null;
  }

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
        Alert.success();
        tagsQuery.refetch();
        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags,
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
  graphql(
    gql`
      query tagsQuery($type: String) {
        tags(type: $type) {
          _id
          name
          type
          colorCode
          createdAt
          objectCount
        }
      }
    `,
    {
      name: 'tagsQuery',
      options: ({ type }) => ({
        variables: { type },
        fetchPolicy: 'network-only'
      })
    }
  ),
  graphql(
    gql`
      mutation tagsAdd($name: String!, $type: String!, $colorCode: String) {
        tagsAdd(name: $name, type: $type, colorCode: $colorCode) {
          _id
        }
      }
    `,
    { name: 'addMutation' }
  ),
  graphql(
    gql`
      mutation tagsEdit(
        $_id: String!
        $name: String!
        $type: String!
        $colorCode: String
      ) {
        tagsEdit(_id: $_id, name: $name, type: $type, colorCode: $colorCode) {
          _id
        }
      }
    `,
    { name: 'editMutation' }
  ),
  graphql(
    gql`
      mutation tagsRemove($ids: [String!]!) {
        tagsRemove(ids: $ids)
      }
    `,
    { name: 'removeMutation' }
  )
)(ListContainer);
