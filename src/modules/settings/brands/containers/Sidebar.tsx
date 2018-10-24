import gql from 'graphql-tag';
import { Alert, confirm } from 'modules/common/utils';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { Sidebar } from '../components';
import { mutations, queries } from '../graphql';
import { IBrand } from '../types';

type QueryResponse = {
  brandsQuery: any;
  brandsCountQuery: any;

  addMutation: (
    params: { variables: { name: string; description: string } }
  ) => Promise<any>;
  editMutation: (
    params: { variables: { name: string; description: string } }
  ) => Promise<any>;
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

const SidebarContainer = (props: ChildProps<QueryResponse>) => {
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
  const remove = brandId => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: brandId }
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

const commonOptions = ({ queryParams, currentBrandId }) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.brands),
        variables: { perPage: queryParams.limit || 20 }
      },
      {
        query: gql(queries.brands),
        variables: {}
      },
      {
        query: gql(queries.brandDetail),
        variables: { _id: currentBrandId || '' }
      },
      { query: gql(queries.brandsCount) }
    ]
  };
};

export default compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: ({ queryParams }: { queryParams: any }) => ({
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
