import React from 'react';

import Form from '../../containers/department/Form';
import { IDepartment } from '../../types';
import BlockItem from '../common/Item';

type Props = {
  department: IDepartment;
  deleteDepartment: (_id: string, callback: () => void) => void;
  refetch: () => void;
  isChild?: boolean;
};

export default function Item({
  department,
  isChild,
  refetch,
  deleteDepartment
}: Props) {
  const renderForm = ({ closeModal }) => {
    return <Form department={department} closeModal={closeModal} />;
  };

  return (
    <BlockItem
      item={department}
      title="department"
      icon={isChild ? 'arrows-up-right' : 'building'}
      isChild={isChild}
      renderForm={renderForm}
      deleteItem={deleteDepartment}
      refetch={refetch}
      queryParamName="departmentId"
    />
  );
}
