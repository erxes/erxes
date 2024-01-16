import { Counts, IRouterProps } from '@erxes/ui/src/types';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src/layout/styles';
import { __, router } from '@erxes/ui/src/utils';

import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
// import { withRouter } from 'react-router-dom';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';

const TYPES = [
  { value: 'customer', label: 'Customer' },
  { value: 'company', label: 'Company' },
];

interface IProps extends IRouterProps {
  counts: Counts;
  emptyText?: string;
}

function TypeFilter({ history, counts, emptyText }: IProps) {
  const onRemove = () => {
    router.removeParams(history, 'type');
  };

  const extraButtons = (
    <>
      {router.getParam(history, 'type') && (
        <a href="#" tabIndex={0} onClick={onRemove}>
          <Icon icon="times-circle" />
        </a>
      )}
    </>
  );

  const data = (
    <SidebarList>
      {TYPES.map((type, index) => {
        const onClick = () => {
          router.setParams(history, { type: type.value });
          router.removeParams(history, 'page');
        };

        return (
          <li key={index}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'type') === type.value ? 'active' : ''
              }
              onClick={onClick}
            >
              <FieldStyle>{__(type.label)}</FieldStyle>
              <SidebarCounter>{counts[type.value]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by type')}
      collapsible={false}
      extraButtons={extraButtons}
      name="showFilterByType"
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={TYPES.length}
        emptyText={emptyText ? emptyText : 'Loading'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default TypeFilter;
