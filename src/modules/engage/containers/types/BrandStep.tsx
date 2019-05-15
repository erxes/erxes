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
import { BrandStep } from '../../components';
import { queries } from '../../graphql';

type Props = {
  renderContent: (
    {
      actionSelector,
      content,
      customerCounts
    }: {
      actionSelector: React.ReactNode;
      content: React.ReactNode;
      customerCounts: React.ReactNode;
    }
  ) => React.ReactNode;
  onChange: (name: 'brandId', value: string) => void;
  brandId: string;
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

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands || [],
    counts: customerCounts.byBrand || {},
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
