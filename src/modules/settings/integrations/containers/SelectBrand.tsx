import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import {
  BrandAddMutationResponse,
  BrandMutationVariables,
  BrandsQueryResponse
} from '../../brands/types';

import { mutations as brandMutations } from 'modules/settings/brands/graphql';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import { SelectBrand } from '../components';

type Props = {
  onChange: () => void;
};
type FinalProps = {
  brandsQuery: BrandsQueryResponse;
} & Props &
  BrandAddMutationResponse;

const SelectBrandContainer = (props: ChildProps<FinalProps>) => {
  const { brandsQuery, addMutation } = props;

  const brands = brandsQuery.brands || [];
  if (brandsQuery.loading) {
    return <Spinner objective={true} />;
  }

  // create action
  const save = ({ doc }, callback) => {
    const mutation = addMutation;

    mutation({
      variables: doc
    })
      .then(() => {
        brandsQuery.refetch();

        Alert.success(`You successfully added a brand.`);

        callback();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    brands,
    save
  };

  return <SelectBrand {...updatedProps} />;
};

const commonOptions = () => {
  return {
    refetchQueries: [
      {
        query: gql(brandQueries.brands),
        variables: {}
      }
    ]
  };
};

export default compose(
  graphql<BrandsQueryResponse>(gql(brandQueries.brands), {
    name: 'brandsQuery',
    options: commonOptions
  }),
  graphql<BrandAddMutationResponse, BrandMutationVariables>(
    gql(brandMutations.brandAdd),
    {
      name: 'addMutation'
    }
  )
)(SelectBrandContainer);
