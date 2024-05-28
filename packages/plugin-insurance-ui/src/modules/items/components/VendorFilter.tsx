import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import {
  SidebarCounter,
  SidebarList
} from '@erxes/ui/src/layout/styles';
import { __, router } from '@erxes/ui/src/utils/core';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FilterLabel } from '../../../styles';

interface IProps {
  counts: { [key: string]: number };
  companies: any[];
  loading: boolean;
  emptyText?: string;
}

function Companies({

  counts,
  companies,
  loading,
  emptyText,
}: IProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const data = (
    <SidebarList>
      {companies.map((company) => {
        const erxesCompany = company.company;
        const onClick = () => {
          router.removeParams(navigate, location, 'page');
          router.setParams(navigate, location, { company: erxesCompany._id });
        };

        return (
          <li key={erxesCompany._id}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(location, 'company') === erxesCompany._id
                  ? 'active'
                  : ''
              }
              onClick={onClick}
            >
              <FilterLabel>{erxesCompany.primaryName || ''}</FilterLabel>
              <SidebarCounter>{counts[erxesCompany._id]}</SidebarCounter>
            </a>
          </li>
        );
      })}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by vendor')}
      collapsible={companies.length > 5}
      name="vendorFilter"
        isOpen={true}
    >
      <DataWithLoader
        data={data}
        loading={loading}
        count={companies.length}
        emptyText={emptyText || 'Empty'}
        emptyIcon="leaf"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default Companies;
