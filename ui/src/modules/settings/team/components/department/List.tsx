import React from 'react';

import Form from '../../containers/department/Form';
import Item from '../../containers/department/Item';
import BlockList from '../common/BlockList';
import { generateTree } from '../../utils';

type Props = {
  listQuery: any;
};

export default function List({ listQuery }: Props) {
  const allDepartments = listQuery.data.departments || [];

  const renderForm = ({ closeModal }) => {
    return <Form closeModal={closeModal} />;
  };

  const renderChildren = (parentId?) => {
    return generateTree(allDepartments, parentId, node => (
      <Item
        key={node._id}
        isChild={node.parentId ? true : false}
        department={node}
        refetch={listQuery.refetch}
      />
    ));
  };

  return (
    <BlockList
      allDatas={allDepartments}
      renderForm={renderForm}
      renderItems={renderChildren(null)}
      title="Department"
    />
  );
}
