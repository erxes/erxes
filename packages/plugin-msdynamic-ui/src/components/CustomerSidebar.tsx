import { SidebarList } from '@erxes/ui/src/layout/styles';
import { Box } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
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
        <>
          <SidebarList className="no-link">
            {(relations || []).map(r => (
              <li>
                {r.brand?.name || r.brandId}: {r.no}
              </li>
            ))}
          </SidebarList>
        </>
      )}
    </Box>
  );
};

export default CustomerSidebar;
