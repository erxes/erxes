import { SidebarList } from '@erxes/ui/src/layout/styles';
import { Box, Button } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { SideBarFooter } from '../../styles';

const CustomerSidebar = ({
  customerId,
  totalAmount,
  count,
  loading,
}: {
  customerId?: string;
  totalAmount: number;
  count: number;
  loading: boolean;
}) => {
  return (
    <Box title={'Pos Orders'}>
      {!loading && (
        <>
          <SidebarList className="no-link">
            <li>
              Sum of orders: {totalAmount ? totalAmount.toLocaleString() : 0}
            </li>
            <li>Number of orders: {count || 0}</li>
            <li>
              Average amount of orders:{' '}
              {totalAmount ? (totalAmount / count).toLocaleString() : 0}
            </li>
          </SidebarList>
          <SideBarFooter>
            <Link to={`/pos-orders?customerId=${customerId}`} style={{}}>
              <Button btnStyle="link">{__(`See more`)}</Button>
            </Link>
          </SideBarFooter>
        </>
      )}
    </Box>
  );
};

export default CustomerSidebar;
