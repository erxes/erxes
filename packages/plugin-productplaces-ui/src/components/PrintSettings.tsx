import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import { Button } from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import React, { useState } from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import PerPrint from './PerPrint';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const add = (e) => {
    e.preventDefault();

    if (!configsMap.dealsProductsDataPrint) {
      configsMap.dealsProductsDataPrint = {};
    }

    // must save prev item saved then new item
    const newPrintConfig = {
      title: 'New Print Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };

    setConfigsMap((prevConfigsMap) => ({
      ...prevConfigsMap,
      dealsProductsDataPrint: {
        ...prevConfigsMap.dealsProductsDataPrint,
        newPrintConfig,
      },
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    delete configsMap.dealsProductsDataPrint[currentConfigKey];
    delete configsMap.dealsProductsDataPrint['newPrintConfig'];

    setConfigsMap(configsMap);

    props.save(configsMap);
  };

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <PerPrint
          key={Math.random()}
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
    const configs = configsMap.dealsProductsDataPrint || {};

    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        {renderConfigs(configs)}
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Print config') },
  ];

  const actionButtons = (
    <Button btnStyle="primary" onClick={add} icon="plus" uppercase={false}>
      New config
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Print config')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Print configs')}</Title>}
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
