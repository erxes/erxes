import {
  __, ContentBox, Button, ControlLabel, FormControl, FormGroup, HeaderDescription, Info,
  MainStyleTitle as Title, Wrapper
} from 'erxes-ui';
import React from 'react';
import { SettingsContent } from '../styles';

import { IConfigsMap } from '../types';

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
      />
    );

    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={this.save}
        icon="check-circle"
        uppercase={false}
      >
        Save
      </Button>
    );

    const content = (
      <ContentBox>
        <SettingsContent title={__('General settings')}>
          <Info>
            <p>
              {__(
                'Хөнгөлөлт бодоходод шаардлагатай тохиргоог тохируулна.'
              ) + '.'}
            </p>
          </Info>
          {this.renderItem('LOYALTY_RATIO_CURRENCY', 'Loyalty ratio currency')}
          {this.renderItem('LOYALTY_PERCENT_OF_DEAL', 'Loyalty percent of deal amount')}
        </SettingsContent>
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
          />
        }
        content={content}
        center={true}
      />
    );
  }
}

export default GeneralSettings;
