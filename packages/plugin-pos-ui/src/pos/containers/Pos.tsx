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
  PosEnvQueryResponse,
  SlotsBulkUpdateMutationResponse,
  SlotsQueryResponse
} from '../../types';
import { IPos, ProductCategoriesQueryResponse, ISlot } from '../../types';
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
  slotsQuery: SlotsQueryResponse;
  posEnvQuery: PosEnvQueryResponse;
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
      slotsQuery,
      posEnvQuery
    } = this.props;

    if (
      (posDetailQuery && posDetailQuery.loading) ||
      (groupsQuery && groupsQuery.loading) ||
      productCategoriesQuery.loading ||
      (slotsQuery && slotsQuery.loading)
    ) {
      return <Spinner objective={true} />;
    }

    const pos = (posDetailQuery && posDetailQuery.posDetail) || ({} as IPos);
    const groups = (groupsQuery && groupsQuery.productGroups) || [];
    const slots = (slotsQuery && slotsQuery.posSlots) || [];
    const productCategories = productCategoriesQuery.productCategories || [];
    const envs = posEnvQuery.posEnv || {};

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
              posId: posId || data.data.posAdd._id,
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
              posId: posId || data.data.posAdd._id,
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
      isActionLoading: this.state.isLoading,
      slots,
      productCategories,
      envs
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
        options: ({ posId }: { posId?: string }) => ({
          fetchPolicy: 'cache-and-network',
          variables: {
            _id: posId || '',
            posId: posId || ''
          }
        })
      }
    ),
    graphql<Props, PosDetailQueryResponse, {}>(gql(queries.posEnv), {
      name: 'posEnvQuery',
      options: () => ({
        fetchPolicy: 'cache-and-network'
      })
    }),
    graphql<{}, AddPosMutationResponse, IPos>(gql(mutations.posAdd), {
      name: 'addPosMutation'
    }),

    graphql<Props, GroupsQueryResponse, { posId: string }>(
      gql(queries.productGroups),
      {
        name: 'groupsQuery',
        skip: ({ posId }) => !posId,
        options: ({ posId }: { posId?: string }) => ({
          fetchPolicy: 'cache-and-network',
          variables: {
            posId: posId || ''
          }
        })
      }
    ),

    graphql<Props, SlotsQueryResponse, { posId: string }>(
      gql(queries.posSlots),
      {
        name: 'slotsQuery',
        skip: ({ posId }) => !posId,
        options: ({ posId }: { posId?: string }) => ({
          variables: { posId: posId || '' },
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
    )
  )(EditPosContainer)
);
