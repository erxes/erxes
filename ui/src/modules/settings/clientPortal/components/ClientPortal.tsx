import { Title } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React, { useState } from 'react';
import Form from './Form';
import Sidebar from './Sidebar';

const breadcrumb = [
  { title: __('Settings'), link: '/settings' },
  { title: __('Segments') }
];

const header = (
  <Wrapper.Header title={__('Client portal')} breadcrumb={breadcrumb} />
);

function ClientPortal(props) {
  const [configType, setConfigType] = useState<string>('general');

  const handleConfigType = (type: string) => setConfigType(type);

  function renderContent() {
    return <Form configType={configType} />;
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
