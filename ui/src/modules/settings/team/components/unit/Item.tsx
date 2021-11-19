import React from 'react';

import Form from '../../containers/unit/Form';
import { IUnit } from '../../types';
import BlockItem from '../common/Item';

type Props = {
  unit: IUnit;
  deleteDepartment: (_id: string, callback: () => void) => void;
  refetch: () => void;
};

export default function Item({ unit, refetch, deleteDepartment }: Props) {
  const renderForm = ({ closeModal }) => {
    return <Form unit={unit} closeModal={closeModal} />;
  };

  return (
    <BlockItem
      item={unit}
      title="unit"
      renderForm={renderForm}
      deleteItem={deleteDepartment}
      refetch={refetch}
      queryParamName="unitId"
    />
  );
}
