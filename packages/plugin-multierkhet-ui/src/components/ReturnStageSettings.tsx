import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import { Button } from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import React, { useState } from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import PerSettings from './ReturnPerSettings';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const add = (e) => {
    e.preventDefault();

    if (!configsMap.stageInReturnConfig) {
      configsMap.stageInReturnConfig = {};
    }

    // must save prev item saved then new item
    const newStageInReturnConfig = {
      title: 'New Erkhet Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      userEmail: '',
      hasVat: false,
      hasCitytax: false,
      defaultPay: 'debtAmount',
    };

    setConfigsMap((prevConfigsMap) => ({
      ...prevConfigsMap,
      stageInReturnConfig: {
        ...prevConfigsMap.stageInReturnConfig,
        newStageInReturnConfig,
      },
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    delete configsMap.stageInReturnConfig[currentConfigKey];
    delete configsMap.stageInReturnConfig['newStageInReturnConfig'];

    setConfigsMap(configsMap);

    props.save(configsMap);
  };

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <PerSettings
          configsMap={configsMap}
          config={configs[key]}
          currentConfigKey={key}
          save={props.save}
          delete={deleteHandler}
        />
      );
    });
  };

  const renderContent = () => {
    const configs = configsMap.stageInReturnConfig || {};

    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        {renderConfigs(configs)}
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Return Erkhet config') },
  ];

  const actionButtons = (
    <Button btnStyle="primary" onClick={add} icon="plus" uppercase={false}>
      New config
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Return Erkhet config')}
          breadcrumb={breadcrumb}
        />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Return Erkhet configs')}</Title>}
          right={actionButtons}
        />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
      hasBorder={true}
      transparent={true}
    />
  );
};

export default GeneralSettings;
