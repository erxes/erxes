import React from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';

import { Alert, confirm } from '@erxes/ui/src/utils';
import { mutations } from '@erxes/ui/src/team/graphql';
import Item from '../../components/department/Item';
import { IDepartment } from '@erxes/ui/src/team/types';

type Props = {
  department: IDepartment;
  refetch: () => void;
  level?: number;
};

export default function ItemContainer(props: Props) {
  const [deleteMutation] = useMutation(gql(mutations.departmentsRemove));

  const deleteDepartment = (_id: string, callback: () => void) => {
    confirm().then(() => {
      deleteMutation({ variables: { ids: [_id] } })
        .then(() => {
          callback();

          Alert.success('Successfully deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  return <Item {...props} deleteDepartment={deleteDepartment} />;
}
