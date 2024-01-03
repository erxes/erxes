import EngageSettingsContent from '../containers/EngageSettingsContent';
import Header from '@erxes/ui-settings/src/general/components/Header';
import React from 'react';
import { Title } from '@erxes/ui-settings/src/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from '@erxes/ui/src/utils';

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
        <Wrapper.ActionBar left={<Title>{__('Campaign config')}</Title>} />
      }
      content={<EngageSettingsContent />}
      transparent={true}
      hasBorder={true}
    />
  );
}

export default EngageConfigs;
