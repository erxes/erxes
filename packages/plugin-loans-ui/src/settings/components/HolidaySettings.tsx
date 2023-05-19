import {
  __,
  Button,
  MainStyleTitle as Title,
  Wrapper,
  HeaderDescription
} from '@erxes/ui/src';
import React from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import PerSettings from './PerHolidayBonus';
import Sidebar from './Sidebar';

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

type State = {
  configsMap: IConfigsMap;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      configsMap: props.configsMap
    };
  }

  add = e => {
    e.preventDefault();
    const { configsMap } = this.state;

    if (!configsMap.holidayConfig) {
      configsMap.holidayConfig = {};
    }

    // must save prev item saved then new item
    configsMap.holidayConfig.newHolidayConfig = {
      title: 'New Holiday Config',
      month: undefined,
      day: undefined
    };

    this.setState({ configsMap });
  };

  delete = (currentConfigKey: string) => {
    const { configsMap } = this.state;
    delete configsMap.holidayConfig[currentConfigKey];
    delete configsMap.holidayConfig['newHolidayConfig'];

    this.setState({ configsMap });

    this.props.save(configsMap);
  };

  renderConfigs(configs) {
    return Object.keys(configs).map(key => {
      return (
        <PerSettings
          key={Math.random()}
          configsMap={this.state.configsMap}
          config={configs[key]}
          currentConfigKey={key}
          save={this.props.save}
          delete={this.delete}
        />
      );
    });
  }

  renderContent() {
    const { configsMap } = this.state;
    const configs = configsMap.holidayConfig || {};

    return (
      <ContentBox id={'HolidaySettingsMenu'}>
        {this.renderConfigs(configs)}
      </ContentBox>
    );
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Ebarimt config') }
    ];

    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={this.add}
        icon="plus"
        uppercase={false}
      >
        New config
      </Button>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Holiday configs')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Holiday configs')}</Title>}
            right={actionButtons}
          />
        }
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
      />
    );
  }
}

export default GeneralSettings;
