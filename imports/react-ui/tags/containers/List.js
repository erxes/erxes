import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { compose, gql, graphql } from 'react-apollo';
import Alert from 'meteor/erxes-notifier';
import { List } from '../components';

const ListContainer = props => {
  const { tagsQuery, type } = props;

  if (tagsQuery.loading) {
    return null;
  }

  const remove = tag => {
    if (!confirm('Are you sure you want to delete this tag?')) {
      // eslint-disable-line no-alert
      return;
    }

    Meteor.call('tags.remove', [tag._id], error => {
      if (error) {
        return Alert.error(error.reason);
      }

      return Alert.success('The tag has been deleted, forever!');
    });
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags,
    type,
    remove,
  };

  return <List {...updatedProps} />;
};

ListContainer.propTypes = {
  type: PropTypes.string,
  tagsQuery: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query tagsQuery($type: String) {
        tags(type: $type) {
          _id
          name
          type
          color
          createdAt
          objectCount
        }
      }
    `,
    {
      name: 'tagsQuery',
      options: ({ type }) => ({
        variables: { type },
        fetchPolicy: 'network-only',
      }),
    },
  ),
)(ListContainer);
