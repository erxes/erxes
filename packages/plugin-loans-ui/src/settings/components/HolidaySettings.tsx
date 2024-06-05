import {
  Button,
  MainStyleTitle as Title,
  Wrapper,
  HeaderDescription,
} from '@erxes/ui/src';
import React, { useState } from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import PerSettings from './PerHolidayBonus';
import Sidebar from './Sidebar';
import { __ } from 'coreui/utils';

function Header() {
  return (
    <HeaderDescription
      icon="/images/actions/25.svg"
      title={__('Holiday config')}
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

    if (!configsMap.holidayConfig) {
      configsMap.holidayConfig = {};
    }

    // must save prev item saved then new item
    const newHolidayConfig = {
      title: 'New Holiday Config',
      month: undefined,
      day: undefined,
    };

    setConfigsMap((prevConfigsMap) => ({
      ...prevConfigsMap,
      holidayConfig: {
        ...prevConfigsMap.holidayConfig,
        newHolidayConfig,
      },
    }));
  };

  const deleteHandler = (currentConfigKey: string) => {
    const updated = Object.fromEntries(
      Object.entries(configsMap.holidayConfig).filter(
        ([key]) => key !== (currentConfigKey || 'newHolidayConfig'),
      ),
    );

    setConfigsMap({ ...configsMap, holidayConfig: updated });

    props.save({ ...configsMap, holidayConfig: updated });
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
    const configs = configsMap.holidayConfig || {};

    return (
      <ContentBox id={'HolidaySettingsMenu'}>
        {renderConfigs(configs)}
      </ContentBox>
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
        <Wrapper.Header title={__('Holiday configs')} breadcrumb={breadcrumb} />
      }
      mainHead={<Header />}
      actionBar={
        <Wrapper.ActionBar
          left={<Title>{__('Holiday configs')}</Title>}
          right={actionButtons}
        />
      }
      leftSidebar={<Sidebar />}
      content={renderContent()}
    />
  );
};

export default GeneralSettings;
