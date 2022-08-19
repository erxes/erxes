import Box from '@erxes/ui/src/components/Box';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import { IRouterProps } from '@erxes/ui/src/types';
import { __, router } from 'coreui/utils';
import { FieldStyle, SidebarCounter, SidebarList } from '@erxes/ui/src/layout/styles';
import { INTEGRATION_KINDS } from '@erxes/ui/src/constants/integrations';
import React from 'react';
import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
  integrationsGetUsedTypes: Array<{ _id: string; name: string }>;
}

function IntegrationFilter({
  history,
  counts,
  integrationsGetUsedTypes
}: IProps) {
  const onClick = kind => {
    router.setParams(history, { integrationType: kind });
    router.removeParams(history, 'page');
  };

  const data = (
    <SidebarList capitalize={true}>
      {integrationsGetUsedTypes.map(kind => (
        <li key={kind._id}>
          <a
            href="#filter"
            tabIndex={0}
            className={
              router.getParam(history, 'integrationType') === kind._id
                ? 'active'
                : ''
            }
            onClick={onClick.bind(null, kind._id)}
          >
            <FieldStyle>{kind.name}</FieldStyle>
            <SidebarCounter>{counts[kind._id] || 0}</SidebarCounter>
          </a>
        </li>
      ))}
    </SidebarList>
  );

  return (
    <Box
      title={__('Filter by integrations')}
      name="showFilterByIntegrations"
      collapsible={true}
    >
      <DataWithLoader
        data={data}
        loading={false}
        count={INTEGRATION_KINDS.ALL.length}
        emptyText="No integrations"
        emptyIcon="puzzle-piece"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(IntegrationFilter);
