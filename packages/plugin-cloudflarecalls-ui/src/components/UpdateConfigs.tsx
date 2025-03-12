import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { FormControl } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import Icon from '@erxes/ui/src/components/Icon';
import Info from '@erxes/ui/src/components/Info';
import React from 'react';

const KEY_LABELS = {
  APP_ID: 'App Id',
  APP_SECRET: 'App Secret',
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
    label?: string,
  ) => {
    const { configsMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{label || KEY_LABELS[key]}</ControlLabel>
        {description && <p>{description}</p>}
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
        beforeTitle={<Icon icon="phone" />}
        transparent={true}
        title="Cloudflare Call"
      >
        <Info>
          <a
            target="_blank"
            href="https://developers.cloudflare.com/calls/get-started"
            rel="noopener noreferrer"
          >
            {'Learn how to set Cloudflare Call Integration Variables'}
          </a>
        </Info>
        {this.renderItem('APP_ID')}
        {this.renderItem('APP_SECRET')}
        <Button onClick={onClick}>{'Save'}</Button>
      </CollapseContent>
    );
  }
}
