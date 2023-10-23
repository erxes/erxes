import BlockList from '../common/BlockList';
import { EmptyState } from '@erxes/ui/src/components';
import Form from '../../containers/branch/Form';
import Item from '../../containers/branch/Item';
import React from 'react';
import { generateTree } from '../../utils';

type Props = {
  listQuery: any;
};

export default function List({ listQuery }: Props) {
  const allBranches = listQuery.data.branches || [];

  const renderChildren = parentId => {
    if (allBranches.length === 0) {
      return <EmptyState icon="ban" text="No branches" size="small" />;
    }

    return generateTree(allBranches, parentId, (node, level) => (
      <Item
        key={node._id}
        branch={node}
        level={level}
        refetch={listQuery.refetch}
      />
    ));
  };

  const renderForm = ({ closeModal }) => {
    return <Form closeModal={closeModal} />;
  };

  return (
    <BlockList
      allDatas={allBranches}
      renderForm={renderForm}
      renderItems={renderChildren('')}
      title="Branch"
    />
  );
}
