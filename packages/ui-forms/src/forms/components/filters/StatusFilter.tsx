import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src/layout/styles';
import { __, router } from '@erxes/ui/src/utils';
import { useLocation, useNavigate } from 'react-router-dom';

import Box from '@erxes/ui/src/components/Box';
import { Counts } from '@erxes/ui/src/types';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import React from 'react';

const statusFilters = [
  { key: 'active', value: 'Active' },
  { key: 'archived', value: 'Archived' },
];

interface IProps {
  counts: Counts;
  emptyText?: string;
}

function StatusFilter({ counts, emptyText }: IProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const data = (
    <SidebarList>
      {statusFilters.map((status, index) => {
        const onClick = () => {
          router.setParams(navigate, location, { status: status.key });
          // router.removeParams(navigate, location, 'page');
        };

        return (
          <li key={index}>
            <a
              href='#filter'
              tabIndex={0}
              className={
                router.getParam(location, 'status') === status.key
                  ? 'active'
                  : ''
              }
              onClick={onClick}
            >
              <FieldStyle>{__(status.value)}</FieldStyle>
              <SidebarCounter>{counts[status.key]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by status')}
      collapsible={statusFilters.length > 5}
      name='showFilterByStatus'
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={statusFilters.length}
        emptyText={emptyText ? emptyText : 'Loading'}
        emptyIcon='leaf'
        size='small'
        objective={true}
      />
    </Box>
  );
}

export default StatusFilter;
