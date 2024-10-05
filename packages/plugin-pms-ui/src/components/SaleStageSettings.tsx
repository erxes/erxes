import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { __ } from '@erxes/ui/src/utils';
import { Button } from '@erxes/ui/src/components';
import { Wrapper } from '@erxes/ui/src/layout';
import React, { useState } from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import PerSettings from './SalePerSettings';
import Sidebar from './Sidebar';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const add = (e) => {
    e.preventDefault();

    if (!configsMap.stageInSaleConfig) {
      configsMap.stageInSaleConfig = {};
    }

    // must save prev item saved then new item
    const newStageInSaleConfig = {
      title: 'New Erkhet Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      brandRules: {
        noBrand: {
          brandId: 'noBrand',
          userEmail: '',
          hasVat: false,
          hasCitytax: false,
          hasPayment: true,
          defaultPay: 'debtAmount',
        },
      },
    };
    setConfigsMap((prevConfigsMap) => ({
      ...prevConfigsMap,
      stageInSaleConfig: {
        ...prevConfigsMap.stageInSaleConfig,
        newStageInSaleConfig,
      },
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    delete configsMap.stageInSaleConfig[currentConfigKey];
    delete configsMap.stageInSaleConfig['newStageInSaleConfig'];

    setConfigsMap(configsMap);

    props.save(configsMap);
  };

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <PerSettings
          key={key}
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
    const configs = configsMap.stageInSaleConfig || {};

    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        {renderConfigs(configs)}
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Erkhet config') },
  ];

  const actionButtons = (
    <Button btnStyle="primary" onClick={add} icon="plus" uppercase={false}>
      New config
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Erkhet config')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Erkhet configs')}</Title>}
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
