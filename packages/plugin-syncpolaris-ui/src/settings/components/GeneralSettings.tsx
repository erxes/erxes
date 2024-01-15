import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon
} from '@erxes/ui/src/components';

import { ContentBox } from '../../styles';
import { IConfigsMap } from '../types';
import { KEY_LABELS } from '../constants';
import React from 'react';
import Sidebar from './SideBar';
import { Title } from '@erxes/ui-settings/src/styles';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';

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
      currentMap: props.configsMap.POLARIS || {}
    };
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.configsMap !== this.props.configsMap) {
      this.setState({ currentMap: this.props.configsMap.POLARIS || {} });
    }
  }

  save = e => {
    e.preventDefault();

    const { currentMap } = this.state;
    const { configsMap } = this.props;
    configsMap.POLARIS = currentMap;

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
          {this.renderItem('apiUrl')}
          {this.renderItem('companyCode')}
          {this.renderItem('role')}
          {this.renderItem('token')}
        </CollapseContent>
      </ContentBox>
    );
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Sync polaris config') }
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
            title={__('Sync polaris config')}
            breadcrumb={breadcrumb}
          />
        }
        // mainHead={<Header />}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Sync polaris configs')}</Title>}
            right={actionButtons}
            background="colorWhite"
          />
        }
        leftSidebar={<Sidebar />}
        content={this.renderContent()}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default GeneralSettings;
