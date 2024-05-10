import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import {
    SidebarCounter,
    SidebarList
} from '@erxes/ui/src/layout/styles';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from '@erxes/ui/src/utils/core';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { FilterLabel } from '../../../styles';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  companies: any[];
  loading: boolean;
  emptyText?: string;
}

function Companies({
  history,
  counts,
  companies,
  loading,
  emptyText,
}: IProps) {
  const data = (
    <SidebarList>
      {companies.map((company) => {
        const erxesCompany = company.company;
        const onClick = () => {
          router.setParams(history, { company: erxesCompany._id });
          router.removeParams(history, 'page');
        };

        return (
          <li key={erxesCompany._id}>
            <a
              href="#filter"
              tabIndex={0}
              className={
                router.getParam(history, 'company') === erxesCompany._id
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

export default withRouter<IProps>(Companies);
