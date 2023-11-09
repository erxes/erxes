import Button from '@erxes/ui/src/components/Button';
import { IConfigsMap } from '../types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { Wrapper } from '@erxes/ui/src/layout';
import SideBar from './SideBar';
import {
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { ContentBox } from '../styles';
import { KEY_LABELS } from '../constants';

type Props = {
  save: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  currentMap: IConfigsMap;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMap: props.configsMap.DYNAMIC || {}
    };
  }

  onSave = e => {
    e.preventDefault();

    const { currentMap } = this.state;
    const { configsMap } = this.props;
    configsMap.DYNAMIC = currentMap;
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

  renderItem = (key: string) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{KEY_LABELS[key]}</ControlLabel>
        <FormControl
          defaultValue={currentMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Msdynamics'), link: '/msdynamics' }
    ];

    const content = (
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent title="General settings" open={true}>
          {this.renderItem('endpoint')}
          {this.renderItem('username')}
          {this.renderItem('password')}
        </CollapseContent>
        <CollapseContent title="Product to dynamic">
          {this.renderItem('category')}
        </CollapseContent>
      </ContentBox>
    );

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
                onClick={this.onSave}
                uppercase={false}
              >
                Save
              </Button>
            }
            background="colorWhite"
          />
        }
        leftSidebar={<SideBar />}
        content={content}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default GeneralSettings;
