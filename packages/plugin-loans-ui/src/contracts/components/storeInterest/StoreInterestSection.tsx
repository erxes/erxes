import Box from '@erxes/ui/src/components/Box';
import { __ } from 'coreui/utils';
import React from 'react';
import Icon from '@erxes/ui/src/components/Icon';
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
