import React from 'react';

import Box from 'modules/common/components/Box';
import { SidebarList } from 'modules/layout/styles';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Form from '../../containers/department/Form';

type Props = {
  listQuery: any;
  deleteDepartment: (_id: string, callback: () => void) => void;
};

export default function List({ listQuery, deleteDepartment }: Props) {
  const renderForm = ({ closeModal }) => {
    return <Form closeModal={closeModal} />;
  };

  const trigger = (
    <a href="#settings" tabIndex={0}>
      <Icon icon="plus" size={10} />
    </a>
  );

  const extraButtons = (
    <ModalTrigger
      content={renderForm}
      title="Add a department"
      trigger={trigger}
    />
  );

  return (
    <Box
      title={__('Departments')}
      name="showDepartments"
      extraButtons={extraButtons}
    >
      <SidebarList className="no-link">
        {(listQuery.data.departments || []).map(item => (
          <li key={item._id} style={{ justifyContent: 'space-between' }}>
            <span>{item.title}</span>
            <span>
              <Icon
                color="red"
                icon="trash"
                onClick={() => deleteDepartment(item._id, listQuery.refetch)}
              />
            </span>
          </li>
        ))}
      </SidebarList>
    </Box>
  );
}
