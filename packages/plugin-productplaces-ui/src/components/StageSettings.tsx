import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import { Button } from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import React, { useState } from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import PerSettings from './PerSettings';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings = (props: Props) => {
  const [configs, setConfigs] = useState<IConfigsMap>(props.configsMap.dealsProductsDataPlaces || {});

  const add = (e) => {
    e.preventDefault();

    // must save prev item saved then new item
    const newPlacesConfig = {
      title: 'New Places Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      conditions: [],
    };
    setConfigs((prevConfigsMap) => ({
      ...prevConfigsMap,
      newPlacesConfig,
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    const dealsProductsDataPlaces = { ...configs };
    delete dealsProductsDataPlaces[currentConfigKey];
    delete dealsProductsDataPlaces['newPlacesConfig'];

    setConfigs({ ...dealsProductsDataPlaces });
    props.save({ ...props.configsMap, dealsProductsDataPlaces });
  };

  const saveHandler = (key, config) => {
    const dealsProductsDataPlaces = { ...configs };
    delete dealsProductsDataPlaces['newPlacesConfig'];
    dealsProductsDataPlaces[key] = config;
    setConfigs({ ...dealsProductsDataPlaces });
    props.save({ ...props.configsMap, dealsProductsDataPlaces })
  }

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <PerSettings
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
    { title: __('Places config') },
  ];

  const actionButtons = (
    <Button btnStyle="primary" onClick={add} icon="plus" uppercase={false}>
      New config
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Places config')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Places configs')}</Title>}
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
