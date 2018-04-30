import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import { queries, mutations } from '../graphql';
import { Sidebar } from '../components';

const SidebarContainer = props => {
  const {
    brandsQuery,
    brandsCountQuery,
    addMutation,
    editMutation,
    removeMutation
  } = props;

  const brands = brandsQuery.brands || [];
  const brandsTotalCount = brandsCountQuery.brandsTotalCount || 0;

  // remove action
  const remove = _id => {
    confirm().then(() => {
      removeMutation({
        variables: { _id }
      })
        .then(() => {
          brandsQuery.refetch();

          Alert.success('Successfully deleted.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  // create or update action
  const save = ({ doc }, callback, brand) => {
    let mutation = addMutation;
    // if edit mode
    if (brand) {
      mutation = editMutation;
      doc._id = brand._id;
    }

    mutation({
      variables: doc
    })
      .then(() => {
        brandsQuery.refetch();

        Alert.success('Successfully saved.');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    brands,
    brandsTotalCount,
    save,
    remove,
    loading: brandsQuery.loading
  };

  return <Sidebar {...updatedProps} />;
};

SidebarContainer.propTypes = {
  brandsQuery: PropTypes.object,
  brandsCountQuery: PropTypes.object,
  addMutation: PropTypes.func,
  editMutation: PropTypes.func,
  removeMutation: PropTypes.func
};

const commonOptions = ({ queryParams, currentBrandId }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.brands),
        variables: { perPage: queryParams.limit || 20 },
        fetchPolicy: 'network-only'
      },
      {
        query: gql(queries.brandDetail),
        variables: { _id: currentBrandId || '' },
        fetchPolicy: 'network-only'
      },
      { query: gql(queries.brandsCount) }
    ]
  };
};

export default compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: ({ queryParams }) => ({
      variables: {
        perPage: queryParams.limit || 20
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.brandsCount), {
    name: 'brandsCountQuery'
  }),
  graphql(gql(mutations.brandAdd), {
    name: 'addMutation',
    options: commonOptions
  }),
  graphql(gql(mutations.brandEdit), {
    name: 'editMutation',
    options: commonOptions
  }),
  graphql(gql(mutations.brandRemove), {
    name: 'removeMutation',
    options: commonOptions
  })
)(SidebarContainer);
