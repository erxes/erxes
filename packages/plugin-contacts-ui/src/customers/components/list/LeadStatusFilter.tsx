import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
} from '@erxes/ui/src/layout/styles';
import { __, router } from 'coreui/utils';

import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import Icon from '@erxes/ui/src/components/Icon';
import { LEAD_STATUS_TYPES } from '@erxes/ui-contacts/src/customers/constants';
import React from 'react';
import { leadStatusChoices } from '../../utils';
import { useLocation, useNavigate } from 'react-router-dom';

interface IProps {
  counts: { [key: string]: number };
  loading: boolean;
  searchable?: boolean;
}

function LeadStatusFilter({ counts, loading, searchable }: IProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const renderCounts = () => {
    const paramKey = 'leadStatus';

    const onClick = (key, value) => {
      router.setParams(navigate, location, { [key]: value });
      router.removeParams(navigate, location, 'page');
    };

    return (
      <SidebarList>
        {leadStatusChoices(__).map(
          ({ value, label }: { value: string; label: string }) => {
            return (
              <li key={Math.random()}>
                <a
                  href="#filter"
                  tabIndex={0}
                  className={
                    router.getParam(location, [paramKey]) === value
                      ? 'active'
                      : ''
                  }
                  onClick={onClick.bind(this, paramKey, value)}
                >
                  <FieldStyle>{label}</FieldStyle>
                  <SidebarCounter>{counts ? counts[value] : 0}</SidebarCounter>
                </a>
              </li>
            );
          },
        )}
      </SidebarList>
    );
  };

  const onClear = () => {
    router.setParams(navigate, location, { leadStatus: null });
  };

  const extraButtons = router.getParam(location, 'leadStatus') && (
    <a href="#cancel" tabIndex={0} onClick={onClear}>
      <Icon icon="times-circle" />
    </a>
  );

  return (
    <Box
      extraButtons={extraButtons}
      title={__('Filter by lead status')}
      name="showFilterByStatus"
    >
      <DataWithLoader
        loading={loading}
        count={Object.keys(LEAD_STATUS_TYPES).length}
        data={renderCounts()}
        emptyText="No Forms"
        emptyIcon="type"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default LeadStatusFilter;
