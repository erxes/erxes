import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  HeaderDescription,
  CollapseContent
} from '@erxes/ui/src/components';
import { __ } from '@erxes/ui/src/utils';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';
import { Wrapper } from '@erxes/ui/src/layout';
import React from 'react';
import { ContentBox } from '../../../styles';

import { IConfigsMap } from '../types';
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
      { title: __('Loyalty configs') }
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
        <CollapseContent title={__('General settings')}>
          {this.renderItem('LoyaltyRatioCurrency', 'Loyalty ratio currency')}
        </CollapseContent>

        <CollapseContent title={__('Share settings')}>
          {this.renderItem('ShareScoreFee', 'Fee for score sharing')}
        </CollapseContent>

        {/* <CollapseContent title={__("Invite settings")}></CollapseContent> */}
      </ContentBox>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__('Loyalty configs')}
            breadcrumb={breadcrumb}
          />
        }
        mainHead={header}
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Loyalty config')}</Title>}
            right={actionButtons}
            withMargin
            wide
            background="colorWhite"
          />
        }
        content={content}
        leftSidebar={<Sidebar />}
        hasBorder={true}
        transparent={true}
        noPadding
      />
    );
  }
}

export default GeneralSettings;
