import gql from 'graphql-tag';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/brands/graphql';
import {
  BrandRemoveMutationResponse,
  BrandRemoveMutationVariables,
  BrandsCountQueryResponse,
  BrandsQueryResponse
} from 'modules/settings/brands/types';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { BrandList } from '../components';

type Props = {
  brandCount: number;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  brandsCountQuery: BrandsCountQueryResponse;
} & Props &
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
          Alert.success('You successfully deleted a brand');
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

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse, { perPage: number }>(
      gql(queries.brands),
      {
        name: 'brandsQuery',
        options: ({ brandCount }: Props) => ({
          variables: {
            perPage: brandCount
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, BrandRemoveMutationResponse, BrandRemoveMutationVariables>(
      gql(mutations.brandRemove),
      {
        name: 'removeMutation',
        options: () => {
          return {
            refetchQueries: [
              {
                query: gql(queries.brands),
                variables: { perPage: 0 }
              },
              { query: gql(queries.brandsCount) }
            ]
          };
        }
      }
    )
  )(BrandListContainer)
);
