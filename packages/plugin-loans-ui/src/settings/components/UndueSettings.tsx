import {
  Button,
  MainStyleTitle as Title,
  Wrapper,
  HeaderDescription
} from '@erxes/ui/src';
import React from 'react';

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

    if (!configsMap.undueConfig) {
      configsMap.undueConfig = {};
    }

    // must save prev item saved then new item
    configsMap.undueConfig.newUndueConfig = {
      title: 'New Loss Config',
      startDate: new Date(),
      endDate: new Date(),
      percent: 0
    };

    this.setState({ configsMap });
  };

  delete = (currentConfigKey: string) => {
    const { configsMap } = this.state;
    delete configsMap.undueConfig[currentConfigKey];
    delete configsMap.undueConfig['newUndueConfig'];

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
    const configs = configsMap.undueConfig || {};

    return (
      <ContentBox id={'UndueSettingsMenu'}>
        {this.renderConfigs(configs)}
      </ContentBox>
    );
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Loan config') }
    ];

    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={this.add}
        icon="plus"
        uppercase={false}
      >
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
        content={this.renderContent()}
      />
    );
  }
}

export default GeneralSettings;
