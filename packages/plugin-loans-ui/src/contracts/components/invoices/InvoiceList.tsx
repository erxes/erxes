import { Spinner, Table, Button } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
import React from 'react';
import { withRouter } from 'react-router-dom';

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
        <Table>
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
