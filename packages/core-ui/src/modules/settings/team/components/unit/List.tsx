import React from 'react';
import BlockList from '../common/BlockList';
import Form from '../../containers/unit/Form';
import Item from '../../containers/unit/Item';
import { EmptyState } from '@erxes/ui/src/components';

type Props = {
  listQuery: any;
};

export default function List({ listQuery }: Props) {
  const allUnits = listQuery.data.units || [];

  const renderForm = ({ closeModal }) => {
    return <Form closeModal={closeModal} />;
  };

  const renderItems = () => {
    if(allUnits.length === 0){
      return <EmptyState icon="ban" text="No units" size="small" />
    }

    return allUnits.map(unit => (
      <Item key={unit._id} unit={unit} refetch={listQuery.refetch} />
    ));
  };

  return (
    <BlockList
      allDatas={allUnits}
      renderForm={renderForm}
      renderItems={renderItems()}
      title="Unit"
    />
  );
}
