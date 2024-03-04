import React from 'react';
import Form from '@erxes/ui/src/components/form/Form';
import { FormControl } from '@erxes/ui/src/components/form';
import Button from '@erxes/ui/src/components/Button';
import { Table, Wrapper } from '@erxes/ui/src';
import LoanRow from './LoanCheckRow';

type Props = {
  toSyncLoans: (action: string, loans: any[]) => void;
  items;
  toggleAll: (targets: any[], containerId: string) => void;
  bulk: any[];
  toggleBulk: (targets: any[], toAdd: boolean) => void;
  onClickCheck: () => void;
  emptyBulk: () => void;
  isAllSelected: boolean;
};

const LoanCheckForm = (props: Props) => {
  const { items, bulk, toggleBulk, isAllSelected } = props;
  const tablehead = ['Number', 'Status', 'Start Date', 'End Date'];

  const renderContent = () => {
    const onChange = () => {
      const { toggleAll, items } = props;
      toggleAll(items, 'loans');
    };

    const onClickSync = (e) => {
      e.stopPropagation();
      const { toSyncLoans, onClickCheck, emptyBulk } = props;
      toSyncLoans('UPDATE', bulk);
      onClickCheck();
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
          <tbody id="loans">
            {(items || []).map((loan) => (
              <LoanRow
                key={loan.number}
                loan={loan}
                isChecked={bulk.includes(loan)}
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

export default LoanCheckForm;
