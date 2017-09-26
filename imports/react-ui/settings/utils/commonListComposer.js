import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'react-apollo';
import Alert from 'meteor/erxes-notifier';
import { pagination, Loading } from '/imports/react-ui/common';

const commonListComposer = options => {
  const { name, gqlListQuery, gqlTotalCountQuery, ListComponent } = options;

  const ListContainer = props => {
    const { listQuery, totalCountQuery, queryParams } = props;

    if (totalCountQuery.loading || listQuery.loading) {
      return <Loading title="Settings" />;
    }

    const totalCount = totalCountQuery[`${name}TotalCount`];
    const objects = listQuery[name];

    const { loadMore, hasMore } = pagination(queryParams, totalCount);

    // remove action
    const remove = id => {
      if (!confirm('Are you sure?')) return;

      Meteor.call(`${name}.remove`, id, error => {
        if (!error) {
          // update queries
          listQuery.refetch();
          totalCountQuery.refetch();
        }

        if (error) {
          return Alert.error(error.reason);
        }

        return Alert.success('Congrats', 'Successfully deleted.');
      });
    };

    // create or update action
    const save = (params, callback, object) => {
      let methodName = `${name}.add`;

      // if edit mode
      if (object) {
        methodName = `${name}.edit`;
        params.id = object._id;
      }

      Meteor.call(methodName, params, error => {
        if (error) return Alert.error(error.reason);

        // update queries
        listQuery.refetch();
        totalCountQuery.refetch();

        Alert.success('Congrats');

        callback(error);
      });
    };

    const updatedProps = {
      ...this.props,
      refetch: listQuery.refetch,
      objects,
      loadMore,
      hasMore,
      save,
      remove,
    };

    return <ListComponent {...updatedProps} />;
  };

  ListContainer.propTypes = {
    totalCountQuery: PropTypes.object,
    listQuery: PropTypes.object,
    queryParams: PropTypes.object,
  };

  return compose(gqlListQuery, gqlTotalCountQuery)(ListContainer);
};

export default commonListComposer;
