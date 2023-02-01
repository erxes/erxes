import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils/core';
import React from 'react';
import { withRouter } from 'react-router-dom';

import { IDistrict } from '../../../districts/types';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  districts: IDistrict[];
  loading: boolean;
  emptyText?: string;
}

function Cities({ history, counts, districts, loading, emptyText }: IProps) {
  const data = (
    <SidebarList>
      {districts.map(district => {
        const onClick = () => {
          router.setParams(history, { district: district._id });
          router.removeParams(history, 'page');
        };

        return (
          <li key={district._id}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'district') === district._id
                  ? 'active'
                  : ''
              }
              onClick={onClick}
            >
              <FieldStyle>{district.name}</FieldStyle>
              <SidebarCounter>{counts[district._id]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by district')}
      collapsible={districts.length > 5}
      name="showFilterByDistrict"
    >
      <DataWithLoader
        data={data}
        loading={loading}
        count={districts.length}
        emptyText={emptyText || 'Empty'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(Cities);
