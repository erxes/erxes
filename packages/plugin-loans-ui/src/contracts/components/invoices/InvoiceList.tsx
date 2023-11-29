import Table from '@erxes/ui/src/components/table';
import { __ } from 'coreui/utils';
import React from 'react';

import { IInvoice } from '../../types';
import ScheduleRow from './InvoiceRow';

interface IProps {
  invoices: IInvoice[];
}

class InvoiceList extends React.Component<IProps> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { invoices } = this.props;

    return (
      <>
        <Table striped>
          <thead>
            <tr>
              <th>{__('Date')}</th>
              <th>{__('Loan Balance')}</th>
              <th>{__('Loan Payment')}</th>
              <th>{__('Interest')}</th>
              <th>{__('Loss')}</th>
              <th>{__('Total')}</th>
            </tr>
          </thead>
          <tbody id="schedules">
            {invoices.map(schedule => (
              <ScheduleRow schedule={schedule} key={schedule._id}></ScheduleRow>
            ))}
          </tbody>
        </Table>
      </>
    );
  }
}

export default InvoiceList;
