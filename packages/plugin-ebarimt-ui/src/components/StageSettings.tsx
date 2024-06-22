import { __, confirm } from '@erxes/ui/src/utils';

import { Button } from '@erxes/ui/src/components';
import { ContentBox } from '../styles';
import Header from './Header';
import { IConfigsMap } from '../types';
import PerSettings from './PerSettings';
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { Title } from '@erxes/ui-settings/src/styles';
import { Wrapper } from '@erxes/ui/src/layout';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings: React.FC<Props> = (props) => {
  const [configsMap, setConfigsMap] = useState(props.configsMap);
  const { save } = props;

  useEffect(() => {
    renderContent();
  }, [configsMap]);

  const add = (e) => {
    e.preventDefault();

    if (!configsMap.stageInEbarimt) {
      configsMap.stageInEbarimt = {};
    }

    // must save prev item saved then new item
    const newEbarimtConfig = {
      title: 'New Ebarimt Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      hasVat: false,
      hasCitytax: false,
      posNo: '10003424',
      companyRD: '',
      merchantTin: '',
      districtCode: '',
      defaultGSCode: '',
      vatPercent: 0,
      cityTaxPercent: 0,
    };

    setConfigsMap((prevConfigsMap) => ({
      ...prevConfigsMap,
      stageInEbarimt: {
        ...prevConfigsMap.stageInEbarimt,
        newEbarimtConfig,
      },
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    confirm('This Action will delete this config are you sure?').then(() => {
      const stageInEbarimt = { ...configsMap.stageInEbarimt };
      delete stageInEbarimt[currentConfigKey];
      delete stageInEbarimt['newEbarimtConfig'];

      setConfigsMap({ ...configsMap, stageInEbarimt });

      save({ ...configsMap, stageInEbarimt });
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
    const configs = configsMap.stageInEbarimt || {};

    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        {renderConfigs(configs)}
      </ContentBox>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Ebarimt config') },
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
        <Wrapper.Header title={__('Ebarimt config')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          background="colorWhite"
          left={<Title>{__('Ebarimt configs')}</Title>}
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
