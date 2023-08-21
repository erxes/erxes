import React from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';

import { Alert, confirm } from '@erxes/ui/src/utils';
import { mutations } from '@erxes/ui/src/team/graphql';
import Item from '../../components/unit/Item';
import { IUnit } from '@erxes/ui/src/team/types';

type Props = {
  unit: IUnit;
  refetch: () => void;
};

export default function ItemContainer(props: Props) {
  const [deleteMutation] = useMutation(gql(mutations.unitsRemove));

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
