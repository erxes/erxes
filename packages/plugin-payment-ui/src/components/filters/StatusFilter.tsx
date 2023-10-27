import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { Counts, IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';
import React from 'react';
import { withRouter } from 'react-router-dom';

import { PAYMENT_STATUS } from '../../components/constants';

interface IProps extends IRouterProps {
  counts: Counts;
  emptyText?: string;
}

function StatusFilter({ history, counts, emptyText }: IProps) {
  const data = (
    <SidebarList>
      {PAYMENT_STATUS.ALL.map((status, index) => {
        const onClick = () => {
          router.setParams(history, { status });
          router.removeParams(history, 'page');
        };

        return (
          <li key={index}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'status') === status ? 'active' : ''
              }
              onClick={onClick}
            >
              <FieldStyle>{__(status)}</FieldStyle>
              <SidebarCounter>{counts[status]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by status')}
      collapsible={PAYMENT_STATUS.ALL.length > 5}
      name="showFilterByStatus"
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={PAYMENT_STATUS.ALL.length}
        emptyText={emptyText ? emptyText : 'Loading'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(StatusFilter);
