import {
  Box,
  Content,
  IntegrationItem,
  IntegrationRow,
  IntegrationWrapper,
} from '@erxes/ui-inbox/src/settings/integrations/components/store/styles';
import { Title } from '@erxes/ui-settings/src/styles';
import { HeaderDescription, Spinner } from '@erxes/ui/src/components';
import { CollapsibleContent } from '@erxes/ui-inbox/src/settings/integrations/components/store/styles';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Sidebar from '../../Sidebar';
import { Link } from 'react-router-dom';
import Collapse from 'react-bootstrap/Collapse';
import {
  RenderDynamicComponent,
  loadDynamicComponent,
} from '@erxes/ui/src/utils/core';
import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';

const breadcrumb = [
  { title: __('Settings'), link: '/settings' },
  {
    title: __('Automations config'),
    link: '/settings/automations/bots',
  },
  { title: __('Bots config') },
];

const getBotsByPlatform = () => {
  let list: any[] = [];

  for (const plugin of (window as any).plugins || []) {
    if (!!plugin?.automationBots?.length) {
      list = [
        ...list,
        ...plugin.automationBots.map((item) => ({
          ...item,
          scope: plugin.scope,
        })),
      ];
    }
  }
  return list;
};

function Settings() {
  const [selectedPlatform, setPlatform] = useState(null as any);

  const header = (
    <HeaderDescription
      icon="/images/actions/25.svg"
      title="Bots configs"
      description=""
    />
  );

  const actionButtons = <></>;

  const renderBotsByPlatform = () => {
    const platforms = getBotsByPlatform();

    if (!platforms.length) {
      return <>Something went wrong</>;
    }

    const handleSelectPlatform = (platform) => {
      console.log(
        selectedPlatform,
        platform,
        selectedPlatform?.name !== platform.name,
      );

      console.log(selectedPlatform?.name !== platform.name ? platform : null);

      setPlatform(selectedPlatform?.name !== platform.name ? platform : null);
    };

    return platforms.map((platform) => (
      <IntegrationItem
        key={platform.name}
        onClick={() => handleSelectPlatform(platform)}
      >
        <Box isInMessenger={false}>
          <img alt="logo" src={platform.logo} />

          <h5>{platform.label}</h5>
          <p>{__(platform.description)}</p>
        </Box>
        <Link to={platform.createUrl}>+ {__('Add')}</Link>
      </IntegrationItem>
    ));
  };

  const renderList = () => {
    if (!selectedPlatform) {
      return null;
    }

    return (
      <ErrorBoundary key={selectedPlatform.scope}>
        <RenderDynamicComponent
          scope={selectedPlatform.scope}
          component={selectedPlatform.list}
          injectedProps={{}}
        />
      </ErrorBoundary>
    );
  };

  const content = (
    <Content>
      <IntegrationWrapper>
        <IntegrationRow>{renderBotsByPlatform()}</IntegrationRow>

        <Collapse in={!!selectedPlatform} unmountOnExit={true}>
          <CollapsibleContent>{renderList()}</CollapsibleContent>
        </Collapse>
      </IntegrationWrapper>
    </Content>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Bots Config')} breadcrumb={breadcrumb} />
      }
      mainHead={header}
      actionBar={
        <Wrapper.ActionBar
          left={<Title capitalize={true}>{__('Bots config')}</Title>}
          right={actionButtons}
          wideSpacing={true}
        />
      }
      content={content}
      leftSidebar={<Sidebar />}
      transparent={true}
      hasBorder={true}
    />
  );
}

export default Settings;
