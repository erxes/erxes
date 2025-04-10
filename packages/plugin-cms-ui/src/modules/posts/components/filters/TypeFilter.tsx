import React from 'react';
import queries from '../../../customPostTypes/graphql/queries';
import { useQuery } from '@apollo/client';
import Box from '@erxes/ui/src/components/Box';
import { __, router } from '@erxes/ui/src/utils/core';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src/layout/styles';
import { useLocation, useNavigate } from 'react-router-dom';

type Props = {
  clientPortalId: string;
};

const TypeFilter = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data, loading } = useQuery(queries.CUSTOM_TYPES, {
    variables: {
      clientPortalId: props.clientPortalId,
    },
  });

  const types = data?.cmsCustomPostTypes || [];

  const Content = (
    <SidebarList>
      {types.map((type) => {
        const onClick = () => {
          router.setParams(navigate, location, { type: type.code });
        };

        return (
          <li key={type.label}>
            <a
              href='#filter'
              tabIndex={0}
              className={
                router.getParam(location, 'type') === type.code ? 'active' : ''
              }
              onClick={onClick}
            >
              <FieldStyle>{type.label}</FieldStyle>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by types')}
      name='showFilterByType'
      isOpen={router.getParam(location, 'type')}
    >
      <DataWithLoader
        data={Content}
        loading={loading}
        count={data?.cmsCustomPostTypes?.length || 0}
        emptyText={'Empty'}
        emptyIcon='leaf'
        size='small'
        objective={true}
      />
    </Box>
  );
};

export default TypeFilter;
