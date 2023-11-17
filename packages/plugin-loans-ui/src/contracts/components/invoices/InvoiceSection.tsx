import { Box } from '@erxes/ui/src';
import { __ } from 'coreui/utils';
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
    <Box title={__(`Invoices`)} name="showSchedules">
      <ScrollTableColls>
        <InvoiceList invoices={invoices}></InvoiceList>
      </ScrollTableColls>
    </Box>
  );
}

export default withConsumer(InvoiceSection);
