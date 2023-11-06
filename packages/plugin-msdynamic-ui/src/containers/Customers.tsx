import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import {
  ToCheckCustomersMutationResponse,
  ToSyncCustomersMutationResponse
} from '../types';
import { Bulk } from '@erxes/ui/src/components';
import Alert from '@erxes/ui/src/utils/Alert';
import { mutations } from '../graphql';
import React, { useState } from 'react';
import Customers from '../components/Customers';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {} & Props &
  ToCheckCustomersMutationResponse &
  ToSyncCustomersMutationResponse;

const CustomersContainer = (props: FinalProps) => {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Spinner />;
  }

  const setSyncStatusTrue = (data: any, products: any, action: string) => {
    data[action].items = data[action].items.map(i => {
      if (products.find(c => c.code === i.code)) {
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

  const toCheckCustomers = () => {
    setLoading(true);
    props
      .toCheckCustomers({
        variables: {}
      })
      .then(response => {
        const data = response.data.toCheckCustomers;

        setSyncStatus(data, 'create');
        setSyncStatus(data, 'update');
        setSyncStatus(data, 'delete');

        setItems(response.data.toCheckCustomers);
        setLoading(false);
      })
      .catch(e => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const toSyncCustomers = (action: string, customers: any[]) => {
    setLoading(true);
    props
      .toSyncCustomers({
        variables: {
          action,
          customers
        }
      })
      .then(() => {
        setLoading(false);
        Alert.success('Success. Please check again.');
      })
      .finally(() => {
        const data = items;

        setSyncStatusTrue(data, customers, action.toLowerCase());
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
    toCheckCustomers,
    toSyncCustomers
  };

  const content = () => <Customers {...updatedProps} />;

  return <Bulk content={content} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ToCheckCustomersMutationResponse, {}>(
      gql(mutations.toCheckCustomers),
      {
        name: 'toCheckCustomers'
      }
    ),
    graphql<Props, ToSyncCustomersMutationResponse, {}>(
      gql(mutations.toSyncCustomers),
      {
        name: 'toSyncCustomers'
      }
    )
  )(CustomersContainer)
);
