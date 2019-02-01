import gql from 'graphql-tag';
import { Alert } from 'modules/common/utils';
import { mutations, queries } from 'modules/settings/brands/graphql';
import {
  BrandAddMutationResponse,
  BrandMutationVariables,
  BrandsCountQueryResponse
} from 'modules/settings/brands/types';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { BrandAdd } from '../components';
import { OnboardConsumer } from '../containers/OnboardContext';

type Props = { changeStep: () => void };

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

const WithQuery = compose(
  graphql<BrandAddMutationResponse, BrandMutationVariables>(
    gql(mutations.brandAdd),
    {
      name: 'addMutation',
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
  ),
  graphql<BrandsCountQueryResponse>(gql(queries.brandsCount), {
    name: 'brandsCountQuery'
  })
)(BrandAddContainer);

export default () => (
  <OnboardConsumer>
    {({ changeStep }) => <WithQuery changeStep={changeStep} />}
  </OnboardConsumer>
);
