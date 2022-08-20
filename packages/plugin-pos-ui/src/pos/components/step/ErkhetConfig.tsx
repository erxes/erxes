import React from 'react';
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  Toggle
} from '@erxes/ui/src';
import { Block, BlockRow, FlexColumn, FlexItem } from '../../../styles';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { IPos } from '../../../types';
import Select from 'react-select-plus';

type Props = {
  onChange: (name: 'erkhetConfig', value: any) => void;
  pos?: IPos;
};

class ErkhetConfig extends React.Component<Props, { config: any }> {
  constructor(props: Props) {
    super(props);

    const config =
      props.pos && props.pos.erkhetConfig
        ? props.pos.erkhetConfig
        : {
            isSyncErkhet: false,
            userEmail: '',
            defaultPay: ''
          };

    this.state = {
      config
    };
  }

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    config[code] = value;

    this.setState({ config }, () => {
      this.props.onChange('erkhetConfig', config);
    });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onChangeSwitch = e => {
    this.onChangeConfig('isSyncErkhet', e.target.checked);
  };

  onChangeSelect = value => {
    this.onChangeConfig('defaultPay', value.value);
  };

  renderInput = (
    key: string,
    title?: string,
    description?: string,
    type?: string
  ) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={config[key]}
          type={type || 'text'}
          onChange={this.onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  renderOther() {
    if (!this.state.config.isSyncErkhet) {
      return <></>;
    }

    return (
      <Block>
        <h4>{__('Other')}</h4>
        <BlockRow>
          {this.renderInput('userEmail', 'user Email', '')}
          {this.renderInput('beginNumber', 'Begin bill number', '')}
          <FormGroup>
            <ControlLabel>{'defaultPay'}</ControlLabel>
            <Select
              value={this.state.config.defaultPay}
              onChange={this.onChangeSelect}
              clearable={false}
              required={true}
              options={[
                { value: 'debtAmount', label: 'debtAmount' },
                { value: 'cashAmount', label: 'cashAmount' },
                { value: 'cardAmount', label: 'cardAmount' },
                { value: 'mobileAmount', label: 'mobileAmount' }
              ]}
            />
          </FormGroup>
        </BlockRow>
      </Block>
    );
  }
  render() {
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <Block>
              <h4>{__('Main')}</h4>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>Is Sync erkhet</ControlLabel>
                  <Toggle
                    id={'isSyncErkhet'}
                    checked={this.state.config.isSyncErkhet || false}
                    onChange={this.onChangeSwitch}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>
                    }}
                  />
                </FormGroup>
              </BlockRow>
            </Block>

            {this.renderOther()}

            <Block />
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default ErkhetConfig;
