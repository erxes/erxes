import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { Sidebar } from '../components';
import { mutations, queries } from '../graphql';
import {
  BrandAddMutationResponse,
  BrandEditMutationResponse,
  BrandMutationVariables,
  BrandRemoveMutationResponse,
  BrandRemoveMutationVariables,
  BrandsCountQueryResponse,
  BrandsQueryResponse
} from '../types';

type Props = {
  queryParams: any;
  currentBrandId?: string;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  brandsCountQuery: BrandsCountQueryResponse;
} & Props &
  BrandAddMutationResponse &
  BrandEditMutationResponse &
  BrandRemoveMutationResponse;

const SidebarContainer = (props: ChildProps<FinalProps>) => {
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

          Alert.success('You successfully deleted a brand.');
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

        Alert.success(
          `You successfully ${brand ? 'updated' : 'added'} a brand.`
        );

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

const commonOptions = ({ queryParams, currentBrandId }: Props) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.brands),
        variables: {
          perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
        }
      },
      {
        query: gql(queries.brands),
        variables: {}
      },
      {
        query: gql(queries.integrationsCount),
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

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse, { perPage: number }>(
      gql(queries.brands),
      {
        name: 'brandsQuery',
        options: ({ queryParams }: { queryParams: any }) => ({
          variables: {
            perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, BrandsCountQueryResponse, {}>(gql(queries.brandsCount), {
      name: 'brandsCountQuery'
    }),
    graphql<Props, BrandAddMutationResponse, BrandMutationVariables>(
      gql(mutations.brandAdd),
      {
        name: 'addMutation',
        options: commonOptions
      }
    ),
    graphql<Props, BrandEditMutationResponse, BrandMutationVariables>(
      gql(mutations.brandEdit),
      {
        name: 'editMutation',
        options: commonOptions
      }
    ),
    graphql<Props, BrandRemoveMutationResponse, BrandRemoveMutationVariables>(
      gql(mutations.brandRemove),
      {
        name: 'removeMutation',
        options: commonOptions
      }
    )
  )(SidebarContainer)
);
