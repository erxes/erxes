import Box from 'modules/common/components/Box';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import { FieldStyle, SidebarCounter, SidebarList } from 'modules/layout/styles';
import { KIND_CHOICES_WITH_TEXT } from 'modules/settings/integrations/constants';
import React from 'react';
import { withRouter } from 'react-router-dom';

interface IProps extends IRouterProps {
  counts: { [key: string]: number };
}

function IntegrationFilter({ history, counts }: IProps) {
  const onClick = kind => {
    router.setParams(history, { integrationType: kind });
  };

  const data = (
    <SidebarList capitalize={true}>
      {KIND_CHOICES_WITH_TEXT.map((kind, index) => (
        <li key={index}>
          <a
            href="#filter"
            tabIndex={0}
            className={
              router.getParam(history, 'integrationType') === kind.value
                ? 'active'
                : ''
            }
            onClick={onClick.bind(null, kind.value)}
          >
            <FieldStyle>{kind.text}</FieldStyle>
            <SidebarCounter>{counts[kind.value] || 0}</SidebarCounter>
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
        count={KIND_CHOICES_WITH_TEXT.length}
        emptyText="No integrations"
        emptyIcon="puzzle-piece"
        size="small"
        objective={true}
      />
    </Box>
  );
}

export default withRouter<IProps>(IntegrationFilter);
