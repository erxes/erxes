import gql from 'graphql-tag';
import { Alert, withProps } from 'modules/common/utils';
import { CountQueryResponse } from 'modules/customers/types';
import { mutations } from 'modules/settings/brands/graphql';
import {
  BrandAddMutationResponse,
  BrandMutationVariables,
  BrandsQueryResponse
} from 'modules/settings/brands/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandStep } from '../components';
import { queries } from '../graphql';
import { sumCounts } from '../utils';

type Props = {
  messageType: string;
  brandIds: string[];
  onChange: (name: string, value: string[]) => void;
  renderContent: (
    {
      actionSelector,
      selectedComponent,
      customerCounts
    }: {
      actionSelector: React.ReactNode;
      selectedComponent: React.ReactNode;
      customerCounts: React.ReactNode;
    }
  ) => React.ReactNode;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  customerCountsQuery: CountQueryResponse;
} & Props &
  BrandAddMutationResponse;

const BrandStepContianer = (props: FinalProps) => {
  const { brandsQuery, addMutation, customerCountsQuery } = props;

  const brandAdd = ({ doc }) => {
    addMutation({ variables: { ...doc } })
      .then(() => {
        brandsQuery.refetch();
        customerCountsQuery.refetch();
        Alert.success('You successfully added a brand');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const customerCounts = customerCountsQuery.customerCounts || {
    byBrand: {}
  };

  const countValues = customerCounts.byBrand || {};
  const customersCount = (ids: string[]) => sumCounts(ids, countValues);

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands || [],
    targetCount: countValues,
    customersCount,
    brandAdd
  };

  return <BrandStep {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(queries.brands), {
      name: 'brandsQuery'
    }),
    graphql<Props, CountQueryResponse, { only: string }>(
      gql(queries.customerCounts),
      {
        name: 'customerCountsQuery',
        options: {
          variables: {
            only: 'byBrand'
          }
        }
      }
    ),
    graphql<Props, BrandAddMutationResponse, BrandMutationVariables>(
      gql(mutations.brandAdd),
      {
        name: 'addMutation'
      }
    )
  )(BrandStepContianer)
);
