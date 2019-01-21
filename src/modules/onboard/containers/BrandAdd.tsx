import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/brands/graphql';
import {
  BrandAddMutationResponse,
  BrandMutationVariables,
  BrandsCountQueryResponse
} from 'modules/settings/brands/types';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { BrandAdd } from '../components';

type Props = { queryParams: any; changeStep: () => void };

type FinalProps = { brandsCountQuery: BrandsCountQueryResponse } & Props &
  BrandAddMutationResponse;

const BrandAddContainer = (props: ChildProps<FinalProps>) => {
  const { brandsCountQuery, addMutation } = props;

  const brandsTotalCount = brandsCountQuery.brandsTotalCount || 0;

  // add brand
  const save = (name: string, callback: () => void) => {
    addMutation({ variables: { name } })
      .then(() => {
        Alert.success('Successfully created a new brand.');

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    brandsTotalCount,
    save
  };

  return <BrandAdd {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandAddMutationResponse, BrandMutationVariables>(
      gql(mutations.brandAdd),
      {
        name: 'addMutation',
        options: ({ queryParams }) => {
          return {
            refetchQueries: [
              {
                query: gql(queries.brands),
                variables: { perPage: queryParams.limit || 20 }
              },
              { query: gql(queries.brandsCount) }
            ]
          };
        }
      }
    ),
    graphql<Props, BrandsCountQueryResponse, {}>(gql(queries.brandsCount), {
      name: 'brandsCountQuery'
    })
  )(BrandAddContainer)
);
