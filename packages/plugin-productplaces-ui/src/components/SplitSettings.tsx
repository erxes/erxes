import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import { Button } from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import React, { useState } from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import PerSplit from './PerSplit';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const add = (e) => {
    e.preventDefault();

    if (!configsMap.dealsProductsDataSplit) {
      configsMap.dealsProductsDataSplit = {};
    }

    // must save prev item saved then new item
    const newSplitConfig = {
      title: 'New Places Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      productCategoryIds: [],
      excludeCategoryIds: [],
      excludeProductIds: [],
      segmentIds: [],
    };

    setConfigsMap((prevConfigsMap) => ({
      ...prevConfigsMap,
      dealsProductsDataSplit: {
        ...prevConfigsMap.dealsProductsDataSplit,
        newSplitConfig,
      },
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    delete configsMap.dealsProductsDataSplit[currentConfigKey];
    delete configsMap.dealsProductsDataSplit['newSplitConfig'];

    setConfigsMap({ configsMap });

    props.save(configsMap);
  };

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <PerSplit
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
    const configs = configsMap.dealsProductsDataSplit || {};

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
