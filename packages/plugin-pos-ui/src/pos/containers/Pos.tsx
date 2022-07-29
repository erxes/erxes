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
  IProductGroup,
  PosDetailQueryResponse,
  SlotsBulkUpdateMutationResponse,
  SlotsQueryResponse
} from '../../types';
import {
  IPos,
  ProductCategoriesQueryResponse,
  BranchesQueryResponse,
  ISlot
} from '../../types';
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
  slotsQuery: SlotsQueryResponse;
} & Props &
  EditPosMutationResponse &
  AddPosMutationResponse &
  GroupsBulkInsertMutationResponse &
  IRouterProps &
  SlotsBulkUpdateMutationResponse;

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
      slotsBulkUpdateMutation,
      history,
      productCategoriesQuery,
      branchesQuery,
      slotsQuery
    } = this.props;

    if (
      (posDetailQuery && posDetailQuery.loading) ||
      groupsQuery.loading ||
      productCategoriesQuery.loading ||
      branchesQuery.loading ||
      slotsQuery.loading
    ) {
      return <Spinner objective={true} />;
    }

    const pos = (posDetailQuery && posDetailQuery.posDetail) || ({} as IPos);
    const groups = groupsQuery.productGroups || [];
    const branches = branchesQuery.branches || [];
    const slots = slotsQuery.posSlots || [];
    const productCategories = productCategoriesQuery.productCategories || [];

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
        .then(data => {
          productGroupsBulkInsertMutation({
            variables: {
              posId: posId || data.addPos.id,
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
          slotsBulkUpdateMutation({
            variables: {
              posId: posId || data.addPos.id,
              slots: doc.posSlots
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
      slots,
      productCategories
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

    graphql<{}, AddPosMutationResponse, IPos>(gql(mutations.posAdd), {
      name: 'addPosMutation'
    }),

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

    graphql<Props, SlotsQueryResponse, { posId: string }>(
      gql(queries.posSlots),
      {
        name: 'slotsQuery',
        options: ({ posId }) => ({
          variables: { posId },
          fetchPolicy: 'network-only'
        })
      }
    ),

    graphql<Props, EditPosMutationResponse, { _id: string } & IPos>(
      gql(mutations.posEdit),
      {
        name: 'editPosMutation'
      }
    ),

    graphql<
      Props,
      GroupsBulkInsertMutationResponse,
      { posId: string; groups: IProductGroup[] }
    >(gql(mutations.saveProductGroups), {
      name: 'productGroupsBulkInsertMutation'
    }),

    graphql<
      Props,
      SlotsBulkUpdateMutationResponse,
      { posId: string; groups: ISlot[] }
    >(gql(mutations.saveSlots), {
      name: 'slotsBulkUpdateMutation'
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
        fetchPolicy: 'network-only'
      })
    })
  )(EditPosContainer)
);
