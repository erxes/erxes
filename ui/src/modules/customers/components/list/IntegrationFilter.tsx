import Box from 'modules/common/components/Box';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import { INTEGRATION_KINDS } from 'modules/settings/integrations/constants';
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
