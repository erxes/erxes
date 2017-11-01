import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { List } from '../components';

const ListContainer = props => {
  const { tagsQuery, type } = props;

  if (tagsQuery.loading) {
    return null;
  }

  const remove = () => {
    // TODO confirm
  };

  const save = ({ tag }) => {
    if (tag) {
      // TODO edit
    }

    // TODO add
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
  tagsQuery: PropTypes.object
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
  )
)(ListContainer);
