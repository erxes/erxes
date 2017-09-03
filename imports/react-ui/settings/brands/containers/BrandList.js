import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { gql, graphql, compose } from 'react-apollo';
import Alert from 'meteor/erxes-notifier';
import { pagination } from '/imports/react-ui/common';
import { BrandList } from '../components';

const BrandListContainer = props => {
  const { totalCountQuery, listQuery, queryParams } = props;

  if (totalCountQuery.loading || listQuery.loading) {
    return null;
  }

  const { loadMore, hasMore } = pagination(queryParams, totalCountQuery.totalBrandsCount);

  // remove action
  const removeBrand = id => {
    if (!confirm('Are you sure?')) return;

    Meteor.call('brands.remove', id, error => {
      if (!error) {
        // update queries
        listQuery.refetch();
        totalCountQuery.refetch();
      }

      if (error) {
        return Alert.error("Can't delete a brand", error.reason);
      }

      return Alert.success('Congrats', 'Brand has deleted.');
    });
  };

  // create or update action
  const saveBrand = (params, callback, brand) => {
    let methodName = 'brands.add';

    // if edit mode
    if (brand) {
      methodName = 'brands.edit';
      params.id = brand._id;
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
    ...props,
    brands: listQuery.brands,
    loadMore,
    hasMore,
    removeBrand,
    saveBrand,
  };

  return <BrandList {...updatedProps} />;
};

BrandListContainer.propTypes = {
  totalCountQuery: PropTypes.object,
  listQuery: PropTypes.object,
  queryParams: PropTypes.object,
};

export default compose(
  graphql(
    gql`
      query brands($limit: Int!) {
        brands(limit: $limit) {
          _id
          code
          name
          description
        }
      }
    `,
    {
      name: 'listQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            limit: queryParams.limit || 10,
          },
        };
      },
    },
  ),
  graphql(
    gql`
      query totalBrandsCount {
        totalBrandsCount
      }
    `,
    {
      name: 'totalCountQuery',
    },
  ),
)(BrandListContainer);
