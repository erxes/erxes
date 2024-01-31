import {
  Box,
  CollapsibleContent,
  Content,
  IntegrationItem,
  IntegrationRow,
  IntegrationWrapper,
} from '@erxes/ui-inbox/src/settings/integrations/components/store/styles';
import { Title } from '@erxes/ui-settings/src/styles';
import { HeaderDescription } from '@erxes/ui/src/components';
import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import { RenderDynamicComponent } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import Collapse from 'react-bootstrap/Collapse';
import { Link } from 'react-router-dom';
import Sidebar from '../../Sidebar';

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
