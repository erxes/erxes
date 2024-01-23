import Box from '@erxes/ui/src/components/Box';
import { __ } from 'coreui/utils';
import React from 'react';

import { ScrollTableColls } from '../../styles';
import withConsumer from '../../../withConsumer';
import { IInvoice } from '../../types';
import InvoiceList from './InvoiceList';

type Props = {
  invoices: IInvoice[];
};

function InvoiceSection({ invoices = [] }: Props) {
  return <InvoiceList invoices={invoices}></InvoiceList>;
}

export default withConsumer(InvoiceSection);
