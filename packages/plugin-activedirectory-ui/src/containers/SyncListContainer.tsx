import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import {
  ToCheckUsersMutationResponse,
  ToSyncUsersMutationResponse,
} from '../types';
import { Bulk } from '@erxes/ui/src/components';
import Alert from '@erxes/ui/src/utils/Alert';
import { mutations } from '../graphql';
import React, { useState } from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import InventoryUsers from '../components/InventoryUsers';

type Props = {
  queryParams: any;
};

type FinalProps = {} & Props &
  ToCheckUsersMutationResponse &
  ToSyncUsersMutationResponse;

const SyncContainer = (props: FinalProps) => {
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(false);

  if (loading) {
    return <Spinner />;
  }

  const setSyncStatusTrue = (data: any, users: any, action: string) => {
    data[action].items = data[action].items.map((i) => {
      if (users.find((c) => c.sAMAccountName === i.sAMAccountName)) {
        const temp = i;
        temp.syncStatus = true;
        return temp;
      }
      return i;
    });
  };

  const setSyncStatus = (data: any, action: string) => {
    const createData = data[action].items.map((d) => ({
      ...d,
      syncStatus: false,
    }));
    data[action].items = createData;

    return data;
  };

  const toCheckUsers = (userName: string, userPass: string) => {
    setLoading(true);
    props
      .toCheckAdUsers({
        variables: { userName, userPass },
      })
      .then((response) => {
        const data = response.data.toCheckAdUsers;

        setSyncStatus(data, 'create');
        setSyncStatus(data, 'update');
        setSyncStatus(data, 'inactive');

        setItems(response.data.toCheckAdUsers);
        setLoading(false);
      })
      .catch((e) => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const toSyncUsers = (action: string, users: any[]) => {
    setLoading(true);
    props
      .toSyncAdUsers({
        variables: {
          action,
          users,
        },
      })
      .then(() => {
        setLoading(false);
        Alert.success('Success. Please check again.');
      })
      .finally(() => {
        const data = items;

        setSyncStatusTrue(data, users, action.toLowerCase());
        setItems(data);
      })
      .catch((e) => {
        Alert.error(e.message);
        setLoading(false);
      });
  };

  const updatedProps = {
    ...props,
    loading,
    items,
    toCheckUsers,
    toSyncUsers,
  };

  const content = () => <InventoryUsers {...updatedProps} />;

  return <Bulk content={content} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, ToCheckUsersMutationResponse, {}>(
      gql(mutations.toCheckUsers),
      {
        name: 'toCheckAdUsers',
      }
    ),
    graphql<Props, ToSyncUsersMutationResponse, {}>(
      gql(mutations.toSyncUsers),
      {
        name: 'toSyncAdUsers',
      }
    )
  )(SyncContainer)
);
