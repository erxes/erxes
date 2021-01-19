import { __, Button, MainStyleTitle as Title, Wrapper } from 'erxes-ui';
import React from 'react';

import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import PerSettings from './PerSettings';
import Sidebar from './Sidebar';

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
      configsMap: props.configsMap,
    };
  }

  add = e => {
    e.preventDefault();
    const { configsMap } = this.state;

    if (!configsMap.ebarimtConfig) {
      configsMap.ebarimtConfig = {}
    }

    // must save prev item saved then new item
    configsMap.ebarimtConfig.newEbarimtConfig = {
      title: 'New Ebarimt Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      url: '',
      apiKey: '',
      apiSecret: '',
      apiToken: '',
      userEmail: '',
      hasVat: false,
      hasCitytax: false,
      checkCompanyUrl: '',
      isEbarimt: true,
      defaultPay: 'debtAmount',
    }

    this.setState({ configsMap });
  }

  delete = (currentConfigKey: string) => {
    const { configsMap } = this.state;
    delete configsMap.ebarimtConfig[currentConfigKey];
    delete configsMap.ebarimtConfig['newEbarimtConfig'];

    this.setState({ configsMap });

    this.props.save(configsMap);
  }

  renderConfigs(configs) {
    return Object.keys(configs).map(key => {
      return (
        <PerSettings
          configsMap={this.state.configsMap}
          config={configs[key]}
          currentConfigKey={key}
          save={this.props.save}
          delete={this.delete}
        />
      )
    })
  }

  renderContent() {
    const { configsMap } = this.state;
    const configs = configsMap.ebarimtConfig || {};

    return (
      <ContentBox id={'GeneralSettingsMenu'}>
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
            title={__('Ebarimt config')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Ebarimt configs')}</Title>}
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
