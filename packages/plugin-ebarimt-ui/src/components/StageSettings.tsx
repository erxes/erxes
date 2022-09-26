import { Button } from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import { Title } from '@erxes/ui-settings/src/styles';

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
      configsMap: props.configsMap
    };
  }

  add = e => {
    e.preventDefault();
    const { configsMap } = this.state;

    if (!configsMap.stageInEbarimt) {
      configsMap.stageInEbarimt = {};
    }

    // must save prev item saved then new item
    configsMap.stageInEbarimt.newEbarimtConfig = {
      title: 'New Ebarimt Config',
      boardId: '',
      pipelineId: '',
      stageId: '',
      userEmail: '',
      hasVat: false,
      hasCitytax: false,
      defaultPay: 'debtAmount',
      districtName: '',
      companyRD: '',
      defaultGSCode: '',
      vatPercent: 0,
      cityTaxPercent: 0
    };

    this.setState({ configsMap });
  };

  delete = (currentConfigKey: string) => {
    const { configsMap } = this.state;
    delete configsMap.stageInEbarimt[currentConfigKey];
    delete configsMap.stageInEbarimt['newEbarimtConfig'];

    this.setState({ configsMap });

    this.props.save(configsMap);
  };

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
      );
    });
  }

  renderContent() {
    const { configsMap } = this.state;
    const configs = configsMap.stageInEbarimt || {};

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
            background="colorWhite"
            left={<Title>{__('Ebarimt configs')}</Title>}
            right={actionButtons}
          />
        }
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
        hasBorder={true}
        transparent={true}
      />
    );
  }
}

export default GeneralSettings;
