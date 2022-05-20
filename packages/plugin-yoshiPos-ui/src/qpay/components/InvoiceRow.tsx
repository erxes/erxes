import React from 'react';
import dayjs from 'dayjs';

import { IQPayInvoice } from '../types';

type Props = {
  invoice: IQPayInvoice;
};

export default function InvoiceRow({ invoice }: Props) {
  return (
    <tr>
      <td>{dayjs(invoice.createdAt).format('YY/MM/DD hh:mm:ss')}</td>
      <td>{invoice.status}</td>
      <td>{Number(invoice.amount).toLocaleString()}</td>
      <td>{invoice.senderInvoiceNo}</td>
    </tr>
  );
}
