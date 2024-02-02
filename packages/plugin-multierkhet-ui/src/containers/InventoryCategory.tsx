import * as compose from 'lodash.flowright';

import {
  ToCheckCategoriesMutationResponse,
  ToSyncCategoriesMutationResponse,
} from '../types';
import { useMutation } from '@apollo/client';
import Alert from '@erxes/ui/src/utils/Alert';
import { Bulk } from '@erxes/ui/src/components';
import { IRouterProps } from '@erxes/ui/src/types';
// import { withRouter } from 'react-router-dom';
import InventoryCategory from '../components/inventoryCategory/InventoryCategory';
import React, { useState } from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../graphql';
import { router } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils/core';

type Props = {
  queryParams: any;
};

type FinalProps = {} & Props & IRouterProps;

const InventoryCategoryContainer = (props: FinalProps) => {
  const [toMultiCheckCategories] =
    useMutation<ToCheckCategoriesMutationResponse>(
      gql(mutations.toCheckCategories),
    );
  const [toMultiSyncCategories] = useMutation<ToSyncCategoriesMutationResponse>(
    gql(mutations.toSyncCategories),
  );

  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(false);

  const brandId = props.queryParams.brandId || 'noBrand';

  const setSyncStatus = (data: any, action: string) => {
    const createData = data[action].items.map((d) => ({
      ...d,
      syncStatus: false,
    }));
    data[action].items = createData;
    return data;
  };

  const setSyncStatusTrue = (data: any, categories: any, action: string) => {
    data[action].items = data[action].items.map((i) => {
      if (categories.find((c) => c.code === i.code)) {
        let temp = i;
        temp.syncStatus = true;
        return temp;
      }
      return i;
    });
  };

  const setBrand = (brandId: string) => {
    router.setParams(props.history, { brandId: brandId });
    return router;
  };

  const toSyncCategories = (action: string, categories: any[]) => {
    setLoading(true);
    toMultiSyncCategories({
      variables: {
        brandId,
        action: action,
        categories: categories,
      },
    })
      .then(() => {
        setLoading(false);
        Alert.success('Success. Please check again.');
      })
      .finally(() => {
        let data = items;

        setSyncStatusTrue(data, categories, action.toLowerCase());

        setItems(data);
      })
      .catch((e) => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const toCheckCategories = () => {
    setLoading(true);
    toMultiCheckCategories({ variables: { brandId } })
      .then((response) => {
        let data = response?.data?.toMultiCheckCategories;

        setSyncStatus(data, 'create');
        setSyncStatus(data, 'update');
        setSyncStatus(data, 'delete');

        setItems(response?.data?.toMultiCheckCategories || {});
        setLoading(false);
      })
      .catch((e) => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  if (loading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    loading: loading,
    toCheckCategories,
    toSyncCategories,
    setBrand,
    items,
  };

  const content = (props) => <InventoryCategory {...props} {...updatedProps} />;

  return <Bulk content={content} />;
};

export default InventoryCategoryContainer;
// export default withRouter<IRouterProps>(InventoryCategoryContainer);
