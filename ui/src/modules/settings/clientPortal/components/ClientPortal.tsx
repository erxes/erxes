import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React, { useState } from 'react';
import Form, { GeneralFormType } from './Form';
import Sidebar from './Sidebar';

type FormConfig = {} & GeneralFormType;

type Props = {
  config: FormConfig;
  handleUpdate: (doc: FormConfig) => void;
};

const breadcrumb = [
  { title: __('Settings'), link: '/settings' },
  { title: __('Client Portal') }
];

const header = (
  <Wrapper.Header title={__('Client portal')} breadcrumb={breadcrumb} />
);

function ClientPortal({ config, handleUpdate }: Props) {
  const [configType, setConfigType] = useState<string>('general');

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
          left={<Title capitalize={true}>{configType}</Title>}
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
