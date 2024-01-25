import { SectionBodyItem } from '@erxes/ui/src/layout/styles';
import { Box, Button } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Link } from 'react-router-dom';

const CustomerSidebar = ({ customerId }: { customerId?: string }) => {
  return (
    <Box title={'Pos Orders'}>
      <div style={{ padding: '1.25rem' }}>
        <SectionBodyItem>sum of orders: 4</SectionBodyItem>
        <SectionBodyItem>number of orders: 4</SectionBodyItem>
        <SectionBodyItem>average amount of orders: 4</SectionBodyItem>
        <Link to={`/pos-orders?customerId=${customerId}`}>
          <Button btnStyle="link">{__(`See more`)}</Button>
        </Link>
      </div>
    </Box>
  );
};

export default CustomerSidebar;
