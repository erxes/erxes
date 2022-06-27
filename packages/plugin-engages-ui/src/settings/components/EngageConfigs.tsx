import { Title } from '@erxes/ui-settings/src/styles';
import { __ } from '@erxes/ui/src/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import EngageSettingsContent from '../containers/EngageSettingsContent';
import Header from '@erxes/ui-settings/src/general/components/Header';
import Sidebar from '@erxes/ui-settings/src/general/containers/Sidebar';

function EngageConfigs() {
  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Campaign config') }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Campaign config')} breadcrumb={breadcrumb} />
      }
      mainHead={
        <Header
          title="Campaign config"
          description="Set up your campaign config."
        />
      }
      actionBar={
        <Wrapper.ActionBar
          withMargin
          wide
          background="colorWhite"
          left={<Title>{__('Campaign config')}</Title>}
        />
      }
      leftSidebar={
        <Sidebar
          item={{
            url: '/settings/campaign-configs',
            text: 'Campaign config'
          }}
        />
      }
      content={<EngageSettingsContent />}
      hasBorder={true}
      transparent={true}
      noPadding
    />
  );
}

export default EngageConfigs;
