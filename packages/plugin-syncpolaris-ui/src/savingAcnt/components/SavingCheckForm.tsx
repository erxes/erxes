import React from 'react';
import Form from '@erxes/ui/src/components/form/Form';
import { FormControl } from '@erxes/ui/src/components/form';
import Button from '@erxes/ui/src/components/Button';
import { Table, Wrapper } from '@erxes/ui/src';
import SavingRow from './SavingCheckRow';

type Props = {
  toSyncSavings: (action: string, savings: any[]) => void;
  items;
  toggleAll: (targets: any[], containerId: string) => void;
  bulk: any[];
  toggleBulk: (targets: any[], toAdd: boolean) => void;
  toCheckSavings: () => void;
  emptyBulk: () => void;
  isAllSelected: boolean;
};

const SavingCheckForm = (props: Props) => {
  const { items, bulk, toggleBulk, isAllSelected } = props;
  const tablehead = ['Number', 'Status', 'Start Date', 'End Date'];

  const renderContent = () => {
    const onChange = (e) => {
      e.stopPropagation();
      e.preventDefault();

      const { toggleAll, items } = props;
      toggleAll(items, 'savings');
    };

    const onClickSync = (e) => {
      e.stopPropagation();
      e.preventDefault();
      const { toSyncSavings, toCheckSavings, emptyBulk } = props;
      toSyncSavings('UPDATE', bulk);
      toCheckSavings();
      emptyBulk();
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
          <tbody id="savings">
            {(items || []).map((saving) => (
              <SavingRow
                key={saving.number}
                saving={saving}
                isChecked={bulk.includes(saving)}
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

export default SavingCheckForm;
