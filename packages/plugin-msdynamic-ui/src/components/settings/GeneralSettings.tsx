import Button from '@erxes/ui/src/components/Button';
import { IConfigsMap } from '../../types';
import { __, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { Wrapper } from '@erxes/ui/src/layout';
import { ContentBox } from '../../styles';
import PerSettings from './PerSettings';
import SettingSideBar from './SettingSideBar';

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

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.configsMap !== this.props.configsMap) {
      this.setState({ configsMap: this.props.configsMap || {} });
    }
  }

  add = e => {
    e.preventDefault();
    const { configsMap } = this.state;

    if (!configsMap.DYNAMIC) {
      configsMap.DYNAMIC = {};
    }

    // must save prev item saved then new item
    configsMap.DYNAMIC.newDYNAMIC = {
      title: 'New MSDynamic Config',
      brandId: '',
      itemApi: '',
      itemCategoryApi: '',
      priceApi: '',
      customerApi: '',
      salesApi: '',
      salesLineApi: '',
      username: '',
      password: ''
    };

    this.setState({ configsMap });
  };

  delete = (currentConfigKey: string) => {
    confirm('This Action will delete this config are you sure?').then(() => {
      const { configsMap } = this.state;
      delete configsMap.DYNAMIC[currentConfigKey];
      delete configsMap.DYNAMIC.newDYNAMIC;

      this.setState({ configsMap });

      this.props.save(configsMap);
    });
  };

  renderConfigs(configs) {
    return Object.keys(configs).map(key => {
      return (
        <PerSettings
          key={key}
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
    const configs = configsMap.DYNAMIC || {};

    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        {this.renderConfigs(configs)}
      </ContentBox>
    );
  }

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Msdynamics'), link: '/msdynamics' }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Msdynamics config')}
            breadcrumb={breadcrumb}
          />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Msdynamic')}</Title>}
            right={
              <Button
                btnStyle="primary"
                icon="check-circle"
                onClick={this.add}
                uppercase={false}
              >
                New config
              </Button>
            }
            background="colorWhite"
          />
        }
        leftSidebar={<SettingSideBar />}
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default GeneralSettings;
