import React from 'react';
import { ScrollTableColls } from '../../styles';
import withConsumer from '../../../withConsumer';
import { IInvoice } from '../../types';
import InvoiceList from './InvoiceList';

type Props = {
  invoices: IInvoice[];
};

function InvoiceSection({ invoices }: Props) {
  return (
    <ScrollTableColls>
      <InvoiceList invoices={invoices}></InvoiceList>
    </ScrollTableColls>
  );
}

export default withConsumer(InvoiceSection);
