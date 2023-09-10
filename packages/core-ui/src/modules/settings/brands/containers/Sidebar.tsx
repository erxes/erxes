import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { IRouterProps } from '@erxes/ui/src/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql, ChildProps } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { mutations, queries } from '../graphql';
import { BrandRemoveMutationResponse } from '../types';
import { BrandsQueryResponse } from '@erxes/ui/src/brands/types';
import { MutationVariables } from '@erxes/ui/src/types';

type Props = {
  queryParams: any;
  currentBrandId?: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
} & Props &
  IRouterProps &
  BrandRemoveMutationResponse;

const SidebarContainer = (props: ChildProps<FinalProps>) => {
  const { brandsQuery, removeMutation, renderButton, history } = props;

  const brands = brandsQuery.brands || [];

  // remove action
  const remove = brandId => {
    confirm().then(() => {
      removeMutation({
        variables: { _id: brandId }
      })
        .then(() => {
          Alert.success('You successfully deleted a brand.');
          history.push('/settings/brands');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const updatedProps = {
    ...props,
    renderButton,
    brands,
    remove,
    loading: brandsQuery.loading
  };

  return <Sidebar {...updatedProps} />;
};

const getRefetchQueries = (queryParams, currentBrandId?: string) => {
  return [
    {
      query: gql(queries.brands),
      variables: {
        perPage: queryParams.limit ? parseInt(queryParams.limit, 10) : 20
      }
    },
    {
      query: gql(queries.brands)
    },
    {
      query: gql(queries.integrationsCount)
    },
    {
      query: gql(queries.brandDetail),
      variables: { _id: currentBrandId || '' }
    },
    { query: gql(queries.brandsCount) },
    { query: gql(queries.brands) }
  ];
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
    graphql<Props, BrandRemoveMutationResponse, MutationVariables>(
      gql(mutations.brandRemove),
      {
        name: 'removeMutation',
        options: ({ queryParams, currentBrandId }: Props) => ({
          refetchQueries: getRefetchQueries(queryParams, currentBrandId)
        })
      }
    )
  )(withRouter<FinalProps>(SidebarContainer))
);
