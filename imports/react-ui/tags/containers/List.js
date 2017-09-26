import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
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

      tagsQuery.refetch();

      return Alert.success('The tag has been deleted, forever!');
    });
  };

  const save = ({ tag, doc, callback }) => {
    const cb = (...params) => {
      callback(...params);

      tagsQuery.refetch();
    };

    if (tag) {
      return Meteor.call('tags.edit', { id: tag._id, doc }, cb);
    }

    return Meteor.call('tags.add', doc, cb);
  };

  const updatedProps = {
    ...props,
    tags: tagsQuery.tags,
    type,
    remove,
    save,
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
        fetchPolicy: 'network-only',
      }),
    },
  ),
)(ListContainer);
