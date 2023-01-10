import React from 'react';

import { IDepartment } from '@erxes/ui/src/team/types';
import Item from '../../../components/department/Item';

type Props = {
  department: IDepartment;
  refetch: () => void;
  level?: number;
};

export default function ItemContainer(props: Props) {
  return <Item {...props} />;
}
