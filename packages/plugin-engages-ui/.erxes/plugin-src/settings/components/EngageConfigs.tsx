import { Title } from '@erxes/ui/src/styles/main';
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
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar left={<Title>{__('Campaign config')}</Title>} />
      }
      leftSidebar={<Sidebar />}
      content={<EngageSettingsContent />}
    />
  );
}

export default EngageConfigs;
