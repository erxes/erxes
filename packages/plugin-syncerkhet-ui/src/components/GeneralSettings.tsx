import {
  Button,
  CollapseContent,
  ControlLabel,
  DataWithLoader,
  FormControl,
  FormGroup,
  Icon
} from '@erxes/ui/src/components';
import { Title } from '@erxes/ui-settings/src/styles';
import { __ } from '@erxes/ui/src/utils';
import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import { KEY_LABELS } from '../constants';
import { ContentBox } from '../styles';
import { IConfigsMap } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import { isEnabled } from '@erxes/ui/src/utils/core';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
  loading: boolean;
};

type State = {
  currentMap: IConfigsMap;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMap: props.configsMap.ERKHET || {}
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.configsMap !== this.props.configsMap) {
      this.setState({ currentMap: this.props.configsMap.ERKHET || {} });
    }
  }

  save = e => {
    e.preventDefault();

    const { currentMap } = this.state;
    const { configsMap } = this.props;
    configsMap.ERKHET = currentMap;

    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, value) => {
    const { currentMap } = this.state;

    currentMap[code] = value;

    this.setState({ currentMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderItem = (key: string, description?: string) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          value={currentMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  renderContent = () => {
    return (
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent
          title="General settings"
          beforeTitle={<Icon icon="settings" />}
          transparent={true}
        >
          {this.renderItem('apiKey')}
          {this.renderItem('apiSecret')}
          {this.renderItem('apiToken')}
          {this.renderItem(
            'getRemainderApiUrl',
            'Get remainder from erkhet api url'
          )}
        </CollapseContent>
        <CollapseContent
          title="Product to erkhet"
          beforeTitle={<Icon icon="settings" />}
          transparent={true}
        >
          {this.renderItem('costAccount', 'Cost Account fullCode on erkhet')}
          {this.renderItem('saleAccount', 'Sale Account fullCode on erkhet')}
          {this.renderItem(
            'productCategoryCode',
            'Default Category Code on erkhet inventory'
          )}
          {this.renderItem(
            'consumeDescription',
            'Set description when incoming erkhet inventory'
          )}
        </CollapseContent>
        <CollapseContent
          title="Customer to erkhet"
          beforeTitle={<Icon icon="settings" />}
          transparent={true}
        >
          {this.renderItem('checkCompanyUrl')}
          {this.renderItem(
            'customerDefaultName',
            'Customer default name on erkhet'
          )}
          {this.renderItem(
            'customerCategoryCode',
            'Customer default category code on erkhet'
          )}
          {this.renderItem(
            'companyCategoryCode',
            'Company default category code on erkhet'
          )}
          {this.renderItem('debtAccounts', 'Split "," account fullcode')}
        </CollapseContent>
        {isEnabled('loans') && (
          <CollapseContent
            title="Loan transaction to erkhet"
            beforeTitle={<Icon icon="settings" />}
            transparent={true}
          >
            {this.renderItem('userEmail', 'user email')}
            {this.renderItem(
              'defaultCustomer',
              'Customer default code on erkhet'
            )}
          </CollapseContent>
        )}
      </ContentBox>
    );
  };

  render() {
    const { loading, configsMap } = this.props;
    const configCount = Object.keys(configsMap.ERKHET || {}).length;

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Sync erkhet config') }
    ];

    const actionButtons = (
      <Button
        btnStyle="success"
        onClick={this.save}
        icon="check-circle"
        uppercase={false}
      >
        Save
      </Button>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Sync erkhet config')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Sync erkhet configs')}</Title>}
            right={actionButtons}
            background="colorWhite"
          />
        }
        leftSidebar={<Sidebar />}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={configCount}
            emptyText={__('There is no config') + '.'}
            emptyImage="/images/actions/8.svg"
          />
        }
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default GeneralSettings;
