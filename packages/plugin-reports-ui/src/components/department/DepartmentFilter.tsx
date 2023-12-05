import React from 'react';

import { EmptyState } from '@erxes/ui/src/components';
import { generateTree } from '../../utils';
import BlockList from './BlockList';
import Item from './Item';

type Props = {
  listQuery: any;
};

export default function List({ listQuery }: Props) {
  const allDepartments = listQuery.data.departments || [];

  const renderChildren = (parentId?) => {
    if (allDepartments.length === 0) {
      return <EmptyState icon="ban" text="No department" size="small" />;
    }

    return generateTree(
      allDepartments,
      parentId,
      (node, level) => {
        return (
          <Item
            key={node._id}
            level={level}
            department={node}
            refetch={listQuery.refetch}
          />
        );
      },
      -1
    );
  };

  return (
    <BlockList
      allDatas={allDepartments}
      renderItems={renderChildren(null)}
      title="Department"
    />
  );
}
