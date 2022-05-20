import React from 'react';

import Table from '../../common/components/table';
import InvoiceRow from './InvoiceRow';

type Props = {
  invoices: any;
};

export default class InvoiceList extends React.Component<Props> {
  render() {
    const { invoices = [] } = this.props;

    return (
      <Table>
        <thead>
          <tr>
            <td>Created at</td>
            <td>Status</td>
            <td>Amount</td>
            <td>Order #</td>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <InvoiceRow invoice={inv} key={inv._id} />
          ))}
        </tbody>
      </Table>
    );
  }
}
