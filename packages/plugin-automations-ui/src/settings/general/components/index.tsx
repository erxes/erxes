import { Title } from '@erxes/ui-settings/src/styles';
import {
  Button,
  EmptyContent,
  EmptyState,
  HeaderDescription,
} from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import Sidebar from '../../Sidebar';

const breadcrumb = [
  { title: __('Settings'), link: '/settings' },
  {
    title: __('Automations config'),
    link: '/settings/automations/general',
  },
  { title: __('General config') },
];

function GeneralSettings() {
  const header = (
    <HeaderDescription
      icon="/images/actions/25.svg"
      title="Automations configs"
      description=""
    />
  );

  const actionButtons = <></>;

  const content = (
    <>
      <EmptyState text="Coming Soon" image="/images/actions/20.svg" />
    </>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('General Config')} breadcrumb={breadcrumb} />
      }
      mainHead={header}
      actionBar={
        <Wrapper.ActionBar
          left={<Title $capitalize={true}>{__('Automations config')}</Title>}
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

export default GeneralSettings;
