import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FormControl } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import Icon from '@erxes/ui/src/components/Icon';
import Info from '@erxes/ui/src/components/Info';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

const KEY_LABELS = {
  WHATSAPP_APP_ID: 'Whatsapp App Id',
  WHATSAPP_APP_SECRET: 'Whatsapp App Secret',
  WHATSAPP_VERIFY_TOKEN: 'Whatsapp Verify Token',
  WHATSAPP_PERMISSIONS: 'Whatsapp Permissions'
};

type Props = {
  loading: boolean;
  updateConfigs: (configsMap: IConfigsMap) => void;
  configsMap: IConfigsMap;
};

type State = {
  configsMap: IConfigsMap;
};

export default class UpdateConfigs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { configsMap: props.configsMap };
  }

  onChangeConfig = (code: string, value) => {
    const { configsMap } = this.state;

    configsMap[code] = value;

    this.setState({ configsMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderItem = (
    key: string,
    type?: string,
    description?: string,
    defaultValue?: string,
    label?: string
  ) => {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{label || KEY_LABELS[key]}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          type={type || 'text'}
          defaultValue={configsMap[key] || defaultValue}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  render() {
    const onClick = () => {
      this.props.updateConfigs(this.state.configsMap);
    };

    return (
      <CollapseContent
        beforeTitle={<Icon icon='whatsapp' />}
        transparent={true}
        title='Whatsapp'>
        <Info>
          <a
            target='_blank'
            href='https://docs.erxes.io/'
            rel='noopener noreferrer'>
            {__('Learn how to set Whatsapp Integration Variables')}
          </a>
        </Info>
        {this.renderItem('WHATSAPP_APP_ID')}
        {this.renderItem('WHATSAPP_APP_SECRET')}
        {this.renderItem('WHATSAPP_VERIFY_TOKEN')}
        {this.renderItem(
          'WHATSAPP_PERMISSIONS',
          '',
          '',
          'pages_messaging,pages_manage_ads,pages_manage_engagement,pages_manage_metadata,pages_read_user_content'
        )}
        <Button onClick={onClick}>{__('Save')}</Button>
      </CollapseContent>
    );
  }
}
