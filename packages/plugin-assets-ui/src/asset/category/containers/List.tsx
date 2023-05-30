import { withProps } from '@erxes/ui/src/utils/core';
import React from 'react';
import * as compose from 'lodash.flowright';
import List from '../components/List';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';
import {
  IAssetCategoryQeuryResponse,
  IAssetCategoriesTotalCountResponse
} from '../../../common/types';
import { Alert, confirm } from '@erxes/ui/src';
type Props = { history?: any; queryParams: any };

type FinalProps = {
  assetCategories: IAssetCategoryQeuryResponse;
  assetCategoryRemove: any;
  assetCategoriesTotalCount: IAssetCategoriesTotalCountResponse;
} & Props;

class ListContainer extends React.Component<FinalProps> {
  render() {
    const {
      assetCategories,
      assetCategoriesTotalCount,
      assetCategoryRemove,
      queryParams,
      history
    } = this.props;

    const removeAssetCategory = _id => {
      confirm().then(() => {
        assetCategoryRemove({ variables: { _id } })
          .then(() => {
            assetCategories.refetch();
            Alert.success(`You successfully deleted a asset category`);
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const refetchCategory = () => {
      assetCategories.refetch();
      assetCategoriesTotalCount.refetch();
    };

    const updateProps = {
      assetCategories: assetCategories.assetCategories,
      totalCount: assetCategoriesTotalCount.assetCategoriesTotalCount,
      loading: assetCategories.loading,
      remove: removeAssetCategory,
      refetchAssetCategories: refetchCategory,
      queryParams,
      history
    };

    return <List {...updateProps} />;
  }
}

const getRefetchQueries = () => {
  return ['assetCategories', 'assetCategoryTotalCount', 'assets'];
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.assetCategory), {
      name: 'assetCategories',
      options: ({ queryParams }) => ({
        variables: {
          status: queryParams?.status,
          parentId: queryParams?.parentId
        },
        refetchQueries: getRefetchQueries(),
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, IAssetCategoriesTotalCountResponse>(
      gql(queries.assetCategoriesTotalCount),
      {
        name: 'assetCategoriesTotalCount'
      }
    ),
    graphql<Props>(gql(mutations.assetCategoryRemove), {
      name: 'assetCategoryRemove'
    })
  )(ListContainer)
);
