import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import EngageSettingsContent from '../containers/EngageSettingsContent';
import Header from './Header';
import Sidebar from './Sidebar';

function EngageConfigs() {
  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Engage config') }
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Engage config')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Engage config')}</Title>}
        />  
      }
      leftSidebar={<Sidebar />}
      content={<EngageSettingsContent />}
    />
  );
}

export default EngageConfigs;