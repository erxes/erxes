import React from 'react';
import Form from '@erxes/ui/src/components/form/Form';
import { FormControl } from '@erxes/ui/src/components/form';
import Button from '@erxes/ui/src/components/Button';
import CustomerRow from './CustomerCheckFormRow';
import { Table, Wrapper, __ } from '@erxes/ui/src';

type Props = {
  toSyncCustomers: (action: string, customers: any[]) => void;
  items;
  toggleAll: (targets: any[], containerId: string) => void;
  bulk: any[];
  toggleBulk: (targets: any[], toAdd: boolean) => void;
  emptyBulk: () => void;
  onClickCheck: () => void;
  isAllSelected: boolean;
};

const TypeForm = (props: Props) => {
  const { items, bulk, toggleBulk, isAllSelected } = props;
  const tablehead = ['Code', 'Last name', 'Firs Name', 'Phones'];

  const renderContent = () => {
    const onChange = () => {
      const { toggleAll, items } = props;
      toggleAll(items, 'customers');
    };

    const onClickSync = (e) => {
      const { toSyncCustomers, onClickCheck, emptyBulk } = props;
      toSyncCustomers('UPDATE', bulk);
      emptyBulk();
      onClickCheck();
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
            {(items || []).map((customer) => (
              <CustomerRow
                customer={customer}
                isChecked={bulk.includes(customer)}
                toggleBulk={toggleBulk}
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
