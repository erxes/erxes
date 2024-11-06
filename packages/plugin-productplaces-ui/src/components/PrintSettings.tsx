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
  const [configs, setConfigs] = useState<IConfigsMap>(props.configsMap.dealsProductsDataPrint || {});

  const add = (e) => {
    e.preventDefault();

    // must save prev item saved then new item
    const newPrintConfig = {
      title: 'New Print Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };

    setConfigs((prevConfigsMap) => ({
      ...prevConfigsMap,
      newPrintConfig,
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    const dealsProductsDataPrint = { ...configs };
    delete dealsProductsDataPrint[currentConfigKey];
    delete dealsProductsDataPrint['newPrintConfig'];

    setConfigs({ ...dealsProductsDataPrint });
    props.save({ ...props.configsMap, dealsProductsDataPrint });
  };

  const saveHandler = (key, config) => {
    const dealsProductsDataPrint = { ...configs };
    delete dealsProductsDataPrint['newPrintConfig'];
    dealsProductsDataPrint[key] = config;
    setConfigs({ ...dealsProductsDataPrint });
    props.save({ ...props.configsMap, dealsProductsDataPrint })
  }

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <PerPrint
          key={Math.random()}
          config={configs[key]}
          currentConfigKey={key}
          save={saveHandler}
          delete={deleteHandler}
        />
      );
    });
  };

  const renderContent = () => {
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
