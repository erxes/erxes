import {
  Button,
  MainStyleTitle as Title,
  Wrapper,
  HeaderDescription,
} from '@erxes/ui/src';
import React, { useState } from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import PerSettings from './PerUndueBonus';
import Sidebar from './Sidebar';
import { __ } from 'coreui/utils';

function Header() {
  return (
    <HeaderDescription
      icon="/images/actions/25.svg"
      title={__('Loan not calc undue settings')}
      description=""
    />
  );
}

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

const GeneralSettings = (props: Props) => {
  const [configsMap, setConfigsMap] = useState<IConfigsMap>(props.configsMap);

  const add = (e) => {
    e.preventDefault();

    if (!configsMap.undueConfig) {
      configsMap.undueConfig = {};
    }

    // must save prev item saved then new item
    const newUndueConfig = {
      title: 'New Loss Config',
      startDate: new Date(),
      endDate: new Date(),
      percent: 0,
    };

    setConfigsMap((prevConfigsMap) => ({
      ...prevConfigsMap,
      undueConfig: {
        ...prevConfigsMap.undueConfig,
        newUndueConfig,
      },
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    const updated = Object.fromEntries(
      Object.entries(configsMap.undueConfig).filter(
        ([key]) => key !== (currentConfigKey || 'newUndueConfig'),
      ),
    );
    setConfigsMap({ ...configsMap, undueConfig: updated });

    props.save({ ...configsMap, undueConfig: updated });
  };

  const renderConfigs = (configs) => {
    return Object.keys(configs).map((key) => {
      return (
        <PerSettings
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
    const configs = configsMap.undueConfig || {};

    return (
      <ContentBox id={'UndueSettingsMenu'}>{renderConfigs(configs)}</ContentBox>
    );
  };

  const breadcrumb = [
    { title: __('Settings'), link: '/settings' },
    { title: __('Loan config') },
  ];

  const actionButtons = (
    <Button btnStyle="primary" onClick={add} icon="plus" uppercase={false}>
      {__('New config')}
    </Button>
  );

  return (
    <Wrapper
      header={
        <Wrapper.Header title={__('Loss configs')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Loss configs')}</Title>}
          right={actionButtons}
        />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
    />
  );
};

export default GeneralSettings;
