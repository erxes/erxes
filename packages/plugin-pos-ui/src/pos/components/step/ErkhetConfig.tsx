import React from 'react';
import { isEnabled } from '@erxes/ui/src/utils/core';
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  Toggle
} from '@erxes/ui/src';
import {
  Block,
  BlockRow,
  BlockRowUp,
  FlexColumn,
  FlexItem
} from '../../../styles';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { IPos } from '../../../types';
import Select from 'react-select-plus';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';

type Props = {
  onChange: (
    name: 'pos' | 'erkhetConfig' | 'checkRemainder',
    value: any
  ) => void;
  pos: IPos;
  checkRemainder: boolean;
};

class ErkhetConfig extends React.Component<
  Props,
  { config: any; checkRemainder: boolean }
> {
  constructor(props: Props) {
    super(props);

    const { pos, checkRemainder } = props;
    const config =
      pos && pos.erkhetConfig
        ? pos.erkhetConfig
        : {
            isSyncErkhet: false,
            userEmail: '',
            defaultPay: '',
            getRemainder: false
          };

    this.state = {
      config,
      checkRemainder
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

  onChangeInputSub = (code: string, key1: string, e) => {
    const { config } = this.state;

    this.onChangeConfig(code, { ...config[code], [key1]: e.target.value });
  };

  onChangeSwitch = e => {
    this.onChangeConfig('isSyncErkhet', e.target.checked);
  };

  onChangeSwitchCheckErkhet = e => {
    let val = e.target.checked;
    if (!this.state.config.isSyncErkhet) {
      val = false;
    }

    if (val && this.state.checkRemainder) {
      this.props.onChange('checkRemainder', false);
      this.setState({ checkRemainder: false });
    }

    this.onChangeConfig('getRemainder', val);
  };

  onChangeSwitchCheckInv = e => {
    let val = e.target.checked;
    if (!isEnabled('inventories')) {
      val = false;
    }

    if (val && this.state.config.getRemainder) {
      this.onChangeConfig('getRemainder', false);
    }

    this.props.onChange('checkRemainder', val);
    this.setState({ checkRemainder: val });
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

  renderInputSub = (
    key: string,
    key1: string,
    title: string,
    description?: string,
    type?: string
  ) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          defaultValue={(config[key] && config[key][key1]) || ''}
          type={type || 'text'}
          onChange={this.onChangeInputSub.bind(this, key, key1)}
          required={true}
        />
      </FormGroup>
    );
  };

  renderAccLoc() {
    const { pos } = this.props;

    if (!pos.isOnline) {
      return (
        <BlockRow>
          {this.renderInput('account', 'Account', '')}
          {this.renderInput('location', 'Location', '')}
        </BlockRow>
      );
    }

    return (
      <>
        {(pos.allowBranchIds || []).map(branchId => {
          return (
            <BlockRow key={branchId}>
              <FormGroup>
                <ControlLabel>Branch</ControlLabel>
                <SelectBranches
                  label="Choose branch"
                  name="branchId"
                  initialValue={branchId}
                  onSelect={() => {}}
                  multi={false}
                />
              </FormGroup>
              {this.renderInputSub(`${branchId}`, 'account', 'Account', '')}
              {this.renderInputSub(`${branchId}`, 'location', 'Location', '')}
            </BlockRow>
          );
        })}
      </>
    );
  }

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
        {this.renderAccLoc()}
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

            <Block>
              <h4>{__('Remainder')}</h4>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>Check erkhet</ControlLabel>
                  <Toggle
                    id={'getRemainder'}
                    checked={this.state.config.getRemainder || false}
                    onChange={this.onChangeSwitchCheckErkhet}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>
                    }}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Check inventories</ControlLabel>
                  <Toggle
                    id={'checkRemainder'}
                    checked={this.state.checkRemainder}
                    onChange={this.onChangeSwitchCheckInv}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>
                    }}
                  />
                </FormGroup>
              </BlockRow>
            </Block>
            <Block />
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default ErkhetConfig;
