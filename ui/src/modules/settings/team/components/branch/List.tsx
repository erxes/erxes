import React from 'react';

import Form from '../../containers/branch/Form';
import Item from '../../containers/branch/Item';
import { generateTree } from '../../utils';
import BlockList from '../common/BlockList';

type Props = {
  listQuery: any;
};

export default function List({ listQuery }: Props) {
  const allBranches = listQuery.data.branches || [];

  const renderChildren = parentId => {
    return generateTree(allBranches, parentId, node => (
      <Item
        key={node._id}
        isChild={node.parentId ? true : false}
        branch={node}
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
      renderItems={renderChildren(null)}
      title="Branch"
    />
  );
}
