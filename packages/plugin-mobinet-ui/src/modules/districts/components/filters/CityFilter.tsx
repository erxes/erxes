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

import { ICity } from '../../../cities/types';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  cities: ICity[];
  loading: boolean;
  emptyText?: string;
}

function Cities({ history, counts, cities, loading, emptyText }: IProps) {
  const data = (
    <SidebarList>
      {cities.map(city => {
        const onClick = () => {
          router.setParams(history, { city: city._id });
          router.removeParams(history, 'page');
        };

        return (
          <li key={city._id}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'city') === city._id ? 'active' : ''
              }
              onClick={onClick}
            >
              <FieldStyle>{city.name}</FieldStyle>
              <SidebarCounter>{counts[city._id]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by city')}
      collapsible={cities.length > 5}
      name="showFilterByCity"
    >
      <DataWithLoader
        data={data}
        loading={loading}
        count={cities.length}
        emptyText={emptyText || 'Empty'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(Cities);
