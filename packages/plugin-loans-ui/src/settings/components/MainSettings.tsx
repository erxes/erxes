import {
  MainStyleTitle as Title,
  Wrapper,
  HeaderDescription,
} from '@erxes/ui/src';
import React, { useState } from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Sidebar from './Sidebar';
import { __ } from 'coreui/utils';
import MainConfig from './MainConfig';

function Header() {
  return (
    <HeaderDescription
      icon="/images/actions/25.svg"
      title={__('Loan not calc loss settings')}
      description=""
    />
  );
}

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const MainSettings = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const renderConfigs = (configs) => {
    return (
      <div>
        <MainConfig
          key={Math.random()}
          configsMap={configsMap}
          currentConfigKey="loansConfig"
          config={{ title: 'main config', ...configs }}
          save={props.save}
        />
      </div>
    );
  };

  const renderContent = () => {
    const configs = configsMap?.loansConfig || {};

    return (
      <ContentBox id={'MainSettingsMenu'}>{renderConfigs(configs)}</ContentBox>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Loan config') },
  ];

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Main configs')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar left={<Title>{__('Main configs')}</Title>} />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
    />
  );
};

export default MainSettings;
