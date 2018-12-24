import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/brands/graphql';
import {
  BrandAddMutationResponse,
  BrandEditMutationResponse,
  BrandRemoveMutationResponse,
  BrandRemoveMutationVariables,
  BrandsCountQueryResponse,
  BrandsQueryResponse
} from 'modules/settings/brands/types';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { BrandList } from '../components';

type Props = {
  queryParams: any;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  brandsCountQuery: BrandsCountQueryResponse;
} & Props &
  BrandAddMutationResponse &
  BrandEditMutationResponse &
  BrandRemoveMutationResponse;

const BrandListContainer = (props: ChildProps<FinalProps>) => {
  const { brandsQuery, removeMutation } = props;

  const brands = brandsQuery.brands || [];

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

  const updatedProps = {
    ...props,
    brands,
    remove,
    loading: brandsQuery.loading
  };

  return <BrandList {...updatedProps} />;
};

const commonOptions = ({ queryParams }: Props) => {
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
            perPage: queryParams.limit || 20
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, BrandRemoveMutationResponse, BrandRemoveMutationVariables>(
      gql(mutations.brandRemove),
      {
        name: 'removeMutation',
        options: commonOptions
      }
    )
  )(BrandListContainer)
);
