import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import {
  ToCheckCategoriesMutationResponse,
  ToSyncCategoriesMutationResponse
} from '../types';
import { Bulk } from '@erxes/ui/src/components';
import Alert from '@erxes/ui/src/utils/Alert';
import { mutations } from '../graphql';
import React, { useState } from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import InventoryCategory from '../components/InventoryCategory';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {} & Props &
  ToCheckCategoriesMutationResponse &
  ToSyncCategoriesMutationResponse;

const InventoryCategoryContainer = (props: FinalProps) => {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Spinner />;
  }

  const setSyncStatusTrue = (data: any, categories: any, action: string) => {
    data[action].items = data[action].items.map(i => {
      if (categories.find(c => c.code === i.code)) {
        const temp = i;
        temp.syncStatus = true;
        return temp;
      }
      return i;
    });
  };

  const setSyncStatus = (data: any, action: string) => {
    const createData = data[action].items.map(d => ({
      ...d,
      syncStatus: false
    }));
    data[action].items = createData;

    return data;
  };

  const toCheckCategory = () => {
    setLoading(true);
    props
      .toCheckProductCategories({
        variables: {}
      })
      .then(response => {
        const data = response.data.toCheckProductCategories;

        setSyncStatus(data, 'create');
        setSyncStatus(data, 'update');
        setSyncStatus(data, 'delete');

        setItems(response.data.toCheckProductCategories);
        setLoading(false);
      })
      .catch(e => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const toSyncCategory = (action: string, categories: any[]) => {
    setLoading(true);
    props
      .toSyncProductCategories({
        variables: {
          action,
          categories
        }
      })
      .then(() => {
        setLoading(false);
        Alert.success('Success. Please check again.');
      })
      .finally(() => {
        const data = items;

        setSyncStatusTrue(data, categories, action.toLowerCase());
        setItems(data);
      })
      .catch(e => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const updatedProps = {
    ...props,
    loading,
    items,
    toCheckCategory,
    toSyncCategory
  };

  const content = () => <InventoryCategory {...updatedProps} />;

  return <Bulk content={content} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ToCheckCategoriesMutationResponse, {}>(
      gql(mutations.toCheckCategories),
      {
        name: 'toCheckProductCategories'
      }
    ),
    graphql<Props, ToSyncCategoriesMutationResponse, {}>(
      gql(mutations.toSyncCategories),
      {
        name: 'toSyncProductCategories'
      }
    )
  )(InventoryCategoryContainer)
);
