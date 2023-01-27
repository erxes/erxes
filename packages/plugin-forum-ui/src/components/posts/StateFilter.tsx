import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IRouterProps, Counts } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import React from 'react';
import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  counts: Counts;
  emptyText?: string;
}

function StatusFilter({ history, counts, emptyText }: IProps) {
  const stateFilters = [
    { key: 'DRAFT', value: 'Draft' },
    { key: 'PUBLISHED', value: 'Published' }
  ];

  const data = (
    <SidebarList>
      {stateFilters.map((state, index) => {
        console.log('state', state.key);
        const onClick = () => {
          router.setParams(history, { state: state.key });
          router.removeParams(history, 'page');
        };

        return (
          <li key={index}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'state') === state.key ? 'active' : ''
              }
              onClick={onClick}
            >
              <FieldStyle>{__(state.value)}</FieldStyle>
              {/* <SidebarCounter>{counts[state.key]}</SidebarCounter> */}
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by state')}
      collapsible={stateFilters.length > 5}
      name="showFilterByState"
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={stateFilters.length}
        emptyText={emptyText ? emptyText : 'Loading'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(StatusFilter);
