import Box from 'modules/common/components/Box';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { statusFilters } from '../constants';
import { Counts } from '../types';

interface IProps extends IRouterProps {
  counts: Counts;
  emptyText?: string;
}

function StatusFilter({ history, counts, emptyText }: IProps) {
  const data = (
    <SidebarList>
      {statusFilters.map((status, index) => {
        const onClick = () => {
          router.setParams(history, { status: status.key });
          router.removeParams(history, 'page');
        };

        return (
          <li key={index}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'status') === status.key
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
      name="showFilterByStatus"
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={statusFilters.length}
        emptyText={emptyText ? emptyText : 'Loading'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(StatusFilter);
