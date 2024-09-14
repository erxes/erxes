import { SidebarList } from '@erxes/ui/src/layout/styles';
import { Box } from '@erxes/ui/src/components';
import React from 'react';

const CustomerSidebar = ({
  relations,
  loading,
}: {
  relations: any[];
  loading: boolean;
}) => {
  return (
    <Box title={'MSD Customer NO'}>
      {!loading && (
        <SidebarList className="no-link">
          {(relations || []).map(r => (
            <li key={r.brandId}>
              {r.brand?.name || r.brandId}: {r.no}
            </li>
          ))}
        </SidebarList>
      )}
    </Box>
  );
};

export default CustomerSidebar;
