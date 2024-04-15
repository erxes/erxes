import React from 'react';
import { __, ControlLabel, FormControl, FormGroup } from '@erxes/ui/src';
import { Block, BlockRow, FlexColumn, FlexItem } from '../../../styles';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { IPos } from '../../../types';
import { DISTRICTS } from '../../../constants';

type Props = {
  onChange: (name: 'ebarimtConfig', value: any) => void;
  pos?: IPos;
};

class EbarimtConfig extends React.Component<Props, { config: any }> {
  constructor(props: Props) {
    super(props);

    const config =
      props.pos && props.pos.ebarimtConfig
        ? props.pos.ebarimtConfig
        : {
          companyName: '',
          ebarimtUrl: '',
          checkCompanyUrl: '',
          hasVat: false,
          hasCitytax: false,
          defaultPay: 'debtAmount',
          districtCode: '',
          companyRD: '',
          defaultGSCode: '',
          vatPercent: 0,
          cityTaxPercent: 0,
          footerText: '',
          hasCopy: false
        };

    this.state = {
      config
    };
  }

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    const newConfig = { ...config, [code]: value };
    this.setState({ config: newConfig }, () => {
      this.props.onChange('ebarimtConfig', newConfig);
    });
  };

  onChangeCheckbox = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
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
          value={config[key]}
          type={type || 'text'}
          onChange={this.onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  renderCheckbox = (key: string, title?: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={config[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
      </FormGroup>
    );
  };

  render() {
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <Block>
              <h4>{__('Main')}</h4>
              <BlockRow>
                {this.renderInput('companyName', 'company Name')}
                {this.renderInput('ebarimtUrl', 'ebarimt Url')}
                {this.renderInput('getTinUrl', 'Tin Url')}
                {this.renderInput('getInfoUrl', 'Info Url')}
              </BlockRow>
            </Block>

            <Block>
              <h4>{__('Other')}</h4>
              <BlockRow>
                {this.renderInput('companyRD', 'companyRD', '')}
                {this.renderInput('merchantTin', 'merchantTin', '')}
                {this.renderInput('posNo', 'posNo', '')}
              </BlockRow>
              <BlockRow>
                {this.renderInput('districtCode', 'districtCode', '')}
                {this.renderInput('branchNo', 'branchNo', '')}
                {this.renderInput('defaultGSCode', 'defaultGSCode', '')}
              </BlockRow>
            </Block>

            <Block>
              <h4>{__('VAT')}</h4>
              <BlockRow>
                {this.renderCheckbox('hasVat', 'Has VAT', '')}
                {this.renderInput('vatPercent', 'VAT Percent', '', 'number')}
              </BlockRow>
            </Block>
            <Block>
              <h4>{__('UB city tax')}</h4>
              <BlockRow>
                {this.renderCheckbox('hasCitytax', 'Has UB city tax', '')}
                {this.renderInput(
                  'cityTaxPercent',
                  'UB city tax Percent',
                  '',
                  'number'
                )}
              </BlockRow>
            </Block>
            <Block />
            <Block>
              <h4>{__('Footer')}</h4>
              <BlockRow>
                {this.renderInput('footerText', 'Footer text', '')}
                {this.renderCheckbox('hasCopy', 'Has copy', '')}
              </BlockRow>
            </Block>
            <Block />
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default EbarimtConfig;
