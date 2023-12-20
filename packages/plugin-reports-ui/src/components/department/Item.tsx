import React from 'react';

import { IDepartment } from '@erxes/ui/src/team/types';
import BlockItem from './BlockItem.tsx';

type Props = {
  department: IDepartment;
  level?: number;
  refetch: void;
};

export default function Item({ department, level }: Props) {
  return (
    <BlockItem
      item={department}
      title="department"
      icon={level && level > 0 ? 'arrows-up-right' : 'building'}
      level={level}
      queryParamName="departmentId"
    />
  );
}
