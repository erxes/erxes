import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import React from 'react';
import { Alert, Spinner, withProps } from '@erxes/ui/src';
import { queries as productQueries } from '@erxes/ui-products/src/graphql';
import { IRouterProps } from '@erxes/ui/src/types';
import { graphql } from 'react-apollo';

import Pos from '../components/Pos';
import {
  AddPosMutationResponse,
  EditPosMutationResponse,
  GroupsBulkInsertMutationResponse,
  GroupsQueryResponse,
  IntegrationMutationVariables,
  IProductGroup,
  PosDetailQueryResponse
} from '../../types';
import { IPos, ProductCategoriesQueryResponse, BranchesQueryResponse } from '../../types';
import { mutations, queries } from '../graphql';

type Props = {
  posId?: string;
  queryParams: any;
  history: any;
};

type State = {
  isLoading: boolean;
};

type FinalProps = {
  posDetailQuery: PosDetailQueryResponse;
  groupsQuery: GroupsQueryResponse;
  productCategoriesQuery: ProductCategoriesQueryResponse;
  branchesQuery: BranchesQueryResponse;
} & Props &
  EditPosMutationResponse &
  AddPosMutationResponse &
  GroupsBulkInsertMutationResponse &
  IRouterProps;

class EditPosContainer extends React.Component<FinalProps, State> {
  constructor(props: FinalProps) {
    super(props);

    this.state = { isLoading: false };
  }

  render() {
    const {
      groupsQuery,
      posDetailQuery,
      editPosMutation,
      addPosMutation,
      productGroupsBulkInsertMutation,
      history,
      productCategoriesQuery,
      branchesQuery,
    } = this.props;

    if (
      posDetailQuery && posDetailQuery.loading ||
      groupsQuery.loading ||
      productCategoriesQuery.loading ||
      branchesQuery.loading
    ) {
      return <Spinner objective={true} />;
    }

    const pos = posDetailQuery && posDetailQuery.posDetail || {} as IPos;
    const groups = groupsQuery.productGroups || [];
    const branches = branchesQuery.branches || [];

    const save = doc => {
      const { posId } = this.props;
      this.setState({ isLoading: true });

      const saveMutation = posId ? editPosMutation : addPosMutation;

      saveMutation({
        variables: {
          _id: posId,
          ...doc
        }
      })
        .then(() => {
          productGroupsBulkInsertMutation({
            variables: {
              posId,
              groups: doc.groups.map(e => ({
                _id: e._id,
                name: e.name,
                description: e.description,
                categoryIds: e.categoryIds || [],
                excludedCategoryIds: e.excludedCategoryIds || [],
                excludedProductIds: e.excludedProductIds || []
              }))
            }
          });
        })
        .then(() => {
          Alert.success('You successfully updated a pos');

          history.push({
            pathname: `/pos`,
            search: '?refetchList=true'
          });
        })

        .catch(error => {
          Alert.error(error.message);

          this.setState({ isLoading: false });
        });
    };

    const updatedProps = {
      ...this.props,
      groups,
      pos,
      save,
      branches,
      isActionLoading: this.state.isLoading,
      currentMode: 'update',
      productCategories: productCategoriesQuery.productCategories
    };

    return <Pos {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, PosDetailQueryResponse, { posId: string }>(
      gql(queries.posDetail),
      {
        name: 'posDetailQuery',
        skip: ({ posId }) => !posId,
        options: ({ posId }) => ({
          fetchPolicy: 'cache-and-network',
          variables: {
            _id: posId,
            posId
          }
        })
      }
    ),

    graphql<{}, AddPosMutationResponse, IntegrationMutationVariables>(
      gql(mutations.posAdd),
      {
        name: 'addPosMutation'
      }
    ),

    graphql<Props, GroupsQueryResponse, { posId: string }>(
      gql(queries.productGroups),
      {
        name: 'groupsQuery',
        options: ({ posId }) => ({
          fetchPolicy: 'cache-and-network',
          variables: {
            posId
          }
        })
      }
    ),

    graphql<Props, EditPosMutationResponse, { _id: string } & IntegrationMutationVariables>(gql(mutations.posEdit), {
      name: 'editPosMutation'
    }),

    graphql<Props, GroupsBulkInsertMutationResponse, { posId: string; groups: IProductGroup[] }>(gql(mutations.saveProductGroups), {
      name: 'productGroupsBulkInsertMutation'
    }),

    graphql<Props, ProductCategoriesQueryResponse>(
      gql(productQueries.productCategories),
      {
        name: 'productCategoriesQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, BranchesQueryResponse>(gql(queries.branches), {
      name: 'branchesQuery',
      options: () => ({
        fetchPolicy: 'network-only',
      })
    }),
  )(EditPosContainer)
);
