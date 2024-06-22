import Table from '@erxes/ui/src/components/table';
import { __ } from 'coreui/utils';
import React from 'react';

import { IInvoice } from '../../types';
import ScheduleRow from './InvoiceRow';

interface IProps {
  invoices: IInvoice[];
}

const InvoiceList = (props: IProps) => {
  const { invoices } = props;

  return (
    <Table $striped>
      <thead>
        <tr>
          <th>{__('Date')}</th>
          <th>{__('Stored interest')}</th>
        </tr>
      </thead>
      <tbody id="schedules">
        {invoices.map((schedule) => (
          <ScheduleRow schedule={schedule} key={schedule._id}></ScheduleRow>
        ))}
      </tbody>
    </Table>
  );
};

export default InvoiceList;
