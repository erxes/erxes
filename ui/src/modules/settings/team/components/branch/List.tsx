import React from 'react';

import Box from 'modules/common/components/Box';
import { SidebarList } from 'modules/layout/styles';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Form from '../../containers/branch/Form';
import Item from '../../containers/branch/Item';
import { generateTree } from '../../utils';

type Props = {
  listQuery: any;
};

export default function List({ listQuery }: Props) {
  const renderChildren = parentId => {
    const allBranches = listQuery.data.branches || [];

    return generateTree(allBranches, parentId, node => (
      <Item
        key={node._id}
        depth={node.parentId ? 1 : 0}
        branch={node}
        refetch={listQuery.refetch}
      />
    ));
  };

  const renderForm = ({ closeModal }) => {
    return <Form closeModal={closeModal} />;
  };

  const trigger = (
    <a href="#settings" tabIndex={0}>
      <Icon icon="plus" size={10} />
    </a>
  );

  const extraButtons = (
    <ModalTrigger content={renderForm} title="Add a branch" trigger={trigger} />
  );

  return (
    <Box title={__('Branch')} name="showBranches" extraButtons={extraButtons}>
      <SidebarList className="no-link">{renderChildren(null)}</SidebarList>
    </Box>
  );
}
