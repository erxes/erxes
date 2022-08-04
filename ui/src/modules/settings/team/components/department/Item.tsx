import React from 'react';

import Form from '../../containers/department/Form';
import { IDepartment } from '../../types';
import BlockItem from '../common/Item';

type Props = {
  department: IDepartment;
  deleteDepartment: (_id: string, callback: () => void) => void;
  refetch: () => void;
  level?: number;
};

export default function Item({
  department,
  refetch,
  deleteDepartment,
  level
}: Props) {
  const renderForm = ({ closeModal }) => {
    return <Form department={department} closeModal={closeModal} />;
  };

  return (
    <BlockItem
      item={department}
      title="department"
      icon={level && level > 0 ? 'arrows-up-right' : 'building'}
      level={level}
      renderForm={renderForm}
      deleteItem={deleteDepartment}
      refetch={refetch}
      queryParamName="departmentId"
    />
  );
}
