import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React, { useState } from 'react';
import { CONFIG_TYPES } from '../constants';
import { ClientPortalConfig } from '../types';
import Form from './Form';
import Sidebar from './Sidebar';

type Props = {
  config: ClientPortalConfig;
  handleUpdate: (doc: ClientPortalConfig) => void;
};

const breadcrumb = [
  { title: __('Settings'), link: '/settings' },
  { title: __('Client Portal'), link: '/settings/client-portal' },
  { title: __('Form') }
];

const header = (
  <Wrapper.Header title={__('Client portal')} breadcrumb={breadcrumb} />
);

const getTitle = (value: string) => {
  for (const type in CONFIG_TYPES) {
    if (CONFIG_TYPES[type].VALUE === value) {
      return CONFIG_TYPES[type].LABEL;
    }
  }
};

function ClientPortal({ config, handleUpdate }: Props) {
  const [configType, setConfigType] = useState<string>(
    CONFIG_TYPES.GENERAL.VALUE
  );

  const handleConfigType = (type: string) => setConfigType(type);

  function renderContent() {
    return (
      <Form
        defaultConfigValues={config}
        handleUpdate={handleUpdate}
        configType={configType}
      />
    );
  }

  return (
    <Wrapper
      header={header}
      actionBar={
        <Wrapper.ActionBar
          left={<Title capitalize={true}>{getTitle(configType)}</Title>}
        />
      }
      content={renderContent()}
      leftSidebar={
        <Sidebar
          selectedConfig={configType}
          handleConfigType={handleConfigType}
        />
      }
    />
  );
}

export default ClientPortal;
