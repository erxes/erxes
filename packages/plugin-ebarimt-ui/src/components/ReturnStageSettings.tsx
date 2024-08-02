import { __, confirm } from '@erxes/ui/src/utils';

import { Button } from '@erxes/ui/src/components';
import { ContentBox } from '../styles';
import Header from './Header';
import { IConfigsMap } from '../types';
import PerSettings from './ReturnPerSettings';
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Title } from '@erxes/ui-settings/src/styles';
import { Wrapper } from '@erxes/ui/src/layout';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings: React.FC<Props> = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);
  const { save } = props;

  useEffect(() => {
    renderContent();
  }, [configsMap]);

  const add = (e) => {
    e.preventDefault();

    if (!configsMap.returnStageInEbarimt) {
      configsMap.returnStageInEbarimt = {};
    }

    // must save prev item saved then new item
    const newEbarimtConfig = {
      title: 'New return Ebarimt Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      userEmail: '',
      hasVat: false,
      hasCitytax: false,
    };

    setConfigsMap((prevConfigsMap) => ({
      ...prevConfigsMap,
      returnStageInEbarimt: {
        ...prevConfigsMap.returnStageInEbarimt,
        newEbarimtConfig,
      },
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    confirm('This Action will delete this config are you sure?').then(() => {
      const returnStageInEbarimt = { ...configsMap.returnStageInEbarimt };
      delete returnStageInEbarimt[currentConfigKey];
      delete returnStageInEbarimt['newEbarimtConfig'];

      setConfigsMap({ ...configsMap, returnStageInEbarimt });

      save({ ...configsMap, returnStageInEbarimt });
    });
  };

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <PerSettings
          key={key}
          configsMap={configsMap}
          config={configs[key]}
          currentConfigKey={key}
          save={save}
          delete={deleteHandler}
        />
      );
    });
  };

  const renderContent = () => {
    const configs = configsMap.returnStageInEbarimt || {};

    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        {renderConfigs(configs)}
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Return Ebarimt config') },
  ];

  const actionButtons = (
    <Button
      btnStyle="success"
      onClick={add}
      icon="plus-circle"
      uppercase={false}
    >
      New config
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header
          title={__('Return Ebarimt config')}
          breadcrumb={breadcrumb}
        />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          background="colorWhite"
          left={<Title>{__('Return Ebarimt configs')}</Title>}
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
