import React from 'react';

import Box from 'modules/common/components/Box';
import { SidebarList } from 'modules/layout/styles';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Form from '../../containers/unit/Form';
import Item from '../../containers/unit/Item';

type Props = {
  listQuery: any;
};

export default function List({ listQuery }: Props) {
  const renderItems = () => {
    const allUnits = listQuery.data.units || [];

    return allUnits.map(unit => (
      <Item key={unit._id} unit={unit} refetch={listQuery.refetch} />
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
    <ModalTrigger content={renderForm} title="Add a unit" trigger={trigger} />
  );

  return (
    <Box title={__('Units')} name="showUnits" extraButtons={extraButtons}>
      <SidebarList className="no-link">{renderItems()}</SidebarList>
    </Box>
  );
}
