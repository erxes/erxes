import { Counts } from '@erxes/ui/src/types';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src/layout/styles';
import { __, router } from '@erxes/ui/src/utils';

import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const TYPES = [
  { value: 'customer', label: 'Customer' },
  { value: 'company', label: 'Company' },
];

interface IProps {
  counts: Counts;
  emptyText?: string;
}

function TypeFilter({ counts, emptyText }: IProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const onRemove = () => {
    router.removeParams(navigate, location, 'type');
  };

  const onClickRow = (type) => {
    router.removeParams(navigate, location, 'page');
    router.setParams(navigate, location, { type });
  };

  const extraButtons = (
    <>
      {router.getParam(location, 'type') && (
        <a href='#' tabIndex={0} onClick={onRemove}>
          <Icon icon='times-circle' />
        </a>
      )}
    </>
  );

  const data = (
    <SidebarList>
      {TYPES.map((type, index) => {
        return (
          <li key={index}>
            <a
              href='#filter'
              tabIndex={0}
              className={
                router.getParam(location, 'type') === type.value ? 'active' : ''
              }
              onClick={() => onClickRow(type.value)}
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
      name='showFilterByType'
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={TYPES.length}
        emptyText={emptyText ? emptyText : 'Loading'}
        emptyIcon='leaf'
        size='small'
        objective={true}
      />
    </Box>
  );
}

export default TypeFilter;
