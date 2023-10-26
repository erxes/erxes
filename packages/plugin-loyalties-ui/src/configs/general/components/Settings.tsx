import {
  Button,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  HeaderDescription,
  Icon
} from '@erxes/ui/src/components';

import { ContentBox } from '../../../styles';
import { IConfigsMap } from '../types';
import React from 'react';
import Sidebar from './Sidebar';
import { Title } from '@erxes/ui-settings/src/styles';
import { Wrapper } from '@erxes/ui/src/layout';
import { __ } from '@erxes/ui/src/utils';

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

  save = e => {
    e.preventDefault();

    const { configsMap } = this.state;

    this.props.save(configsMap);
  };

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderItem = (key: string, title: string, description?: string) => {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={configsMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  render() {
    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      {
        title: __('Loyalties config'),
        link: '/erxes-plugin-loyalty/settings/general'
      },
      { title: __('General config') }
    ];

    const header = (
      <HeaderDescription
        icon="/images/actions/25.svg"
        title="Loyalty configs"
        description=""
      />
    );

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

    const content = (
      <ContentBox id={'GeneralSettingsMenu'}>
        <CollapseContent
          transparent={true}
          beforeTitle={<Icon icon="settings" />}
          title={__('General settings')}
        >
          {this.renderItem('LoyaltyRatioCurrency', 'Loyalty ratio currency')}
        </CollapseContent>

        <CollapseContent
          title={__('Share settings')}
          transparent={true}
          beforeTitle={<Icon icon="share-alt" />}
        >
          {this.renderItem('ShareScoreFee', 'Fee for score sharing')}
        </CollapseContent>
      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('General Config')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={header}
        actionBar={
          <Wrapper.ActionBar
            left={<Title capitalize={true}>{__('Loyalty config')}</Title>}
            right={actionButtons}
            wideSpacing={true}
          />
        }
        content={content}
        leftSidebar={<Sidebar />}
        transparent={true}
        hasBorder={true}
      />
    );
  }
}

export default GeneralSettings;
