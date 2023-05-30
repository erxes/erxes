import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { CountQueryResponse } from '@erxes/ui-contacts/src/customers/types';
import { withProps } from '@erxes/ui/src/utils';
import { mutations } from '@erxes/ui/src/brands/graphql';
import { BrandsQueryResponse } from '@erxes/ui/src/brands/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import BrandStep from '../components/step/BrandStep';
import { queries } from '@erxes/ui-engage/src/graphql';
import { sumCounts } from '@erxes/ui-engage/src/utils';

type Props = {
  messageType: string;
  brandIds: string[];
  onChange: (name: string, value: string[]) => void;
  renderContent: ({
    actionSelector,
    selectedComponent,
    customerCounts
  }: {
    actionSelector: React.ReactNode;
    selectedComponent: React.ReactNode;
    customerCounts: React.ReactNode;
  }) => React.ReactNode;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  customerCountsQuery: CountQueryResponse;
} & Props;

const BrandStepContianer = (props: FinalProps) => {
  const { brandsQuery, customerCountsQuery } = props;

  const customerCounts = customerCountsQuery.customerCounts || {
    byBrand: {}
  };

  const countValues = customerCounts.byBrand || {};
  const customersCount = (ids: string[]) => sumCounts(ids, countValues);

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.brandAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    brands: brandsQuery.brands || [],
    targetCount: countValues,
    customersCount,
    renderButton,
    loadingCount: customerCountsQuery.loading
  };

  return <BrandStep {...updatedProps} />;
};

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.customerCounts),
      variables: { only: 'byBrand' }
    },
    { query: gql(queries.brands) }
  ];
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
    )
  )(BrandStepContianer)
);
