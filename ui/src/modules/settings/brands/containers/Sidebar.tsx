import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import { queries as queriesInbox } from 'modules/inbox/graphql';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { mutations, queries } from '../graphql';
import {
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
  IRouterProps &
  BrandRemoveMutationResponse;

const SidebarContainer = (props: ChildProps<FinalProps>) => {
  const {
    brandsQuery,
    brandsCountQuery,
    removeMutation,
    queryParams,
    currentBrandId,
    history
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
          Alert.success('You successfully deleted a brand.');
          history.push('/settings/brands');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.brandEdit : mutations.brandAdd}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries(queryParams, currentBrandId)}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton,
    brands,
    brandsTotalCount,
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
    { query: gql(queriesInbox.brandList) }
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
    graphql<Props, BrandsCountQueryResponse, {}>(gql(queries.brandsCount), {
      name: 'brandsCountQuery'
    }),
    graphql<Props, BrandRemoveMutationResponse, BrandRemoveMutationVariables>(
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
