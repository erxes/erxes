import React from 'react';
import Form from '@erxes/ui/src/components/form/Form';
import { FormControl } from '@erxes/ui/src/components/form';
import Button from '@erxes/ui/src/components/Button';
import Row from './Row';
import { Table, Wrapper } from '@erxes/ui/src';

type Props = {
  toSync: (action: string, items: any[]) => void;
  items;
  toggleAll: (targets: any[], containerId: string) => void;
  bulk: any[];
  toggleBulk: (targets: any[], toAdd: boolean) => void;
  emptyBulk: () => void;
  onCheck: () => void;
  isAllSelected: boolean;
  tablehead;
  type;
};

const TypeForm = (props: Props) => {
  const { items, bulk, toggleBulk, isAllSelected, tablehead, type } = props;

  const renderContent = () => {
    const onChange = () => {
      const { toggleAll, items } = props;
      toggleAll(items, 'customers');
    };

    const onClickSync = (e) => {
      const { toSync, onCheck, emptyBulk } = props;
      toSync('UPDATE', bulk);
      emptyBulk();
      onCheck();
      e.reset();

      e.preventDefault();
    };

    let actionBarLeft: React.ReactNode;
    if (bulk.length > 0) {
      actionBarLeft = (
        <Button btnStyle="success" icon="check-circle" onClick={onClickSync}>
          Sync
        </Button>
      );
    }

    const actionBar = <Wrapper.ActionBar left={actionBarLeft} />;

    return (
      <>
        {actionBar}
        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th>
                <FormControl
                  checked={isAllSelected}
                  componentClass="checkbox"
                  onChange={onChange}
                />
              </th>
              {tablehead.map((head) => (
                <th key={head}>{head || ''}</th>
              ))}
            </tr>
          </thead>
          <tbody id="customers">
            {(items || []).map((item) => (
              <Row
                key={item._id}
                item={item}
                isChecked={bulk.includes(item)}
                toggleBulk={toggleBulk}
                type={type}
              />
            ))}
          </tbody>
        </Table>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default TypeForm;
