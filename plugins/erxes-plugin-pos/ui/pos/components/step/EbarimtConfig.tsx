import React from 'react';
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup
} from 'erxes-ui';
import {
  Block,
  BlockRow,
  FlexColumn,
  FlexItem
} from '../../../styles';
import { LeftItem } from 'erxes-ui/lib/components/step/styles';
import { IPos } from '../../../types';
import { DISTRICTS } from '../../../constants';

type Props = {
  onChange: (name: "ebarimtConfig", value: any) => void;
  pos?: IPos;
};

class EbarimtConfig extends React.Component<Props, { config: any }> {
  constructor(props: Props) {
    super(props);

    const config = props.pos && props.pos.ebarimtConfig ? props.pos.ebarimtConfig : {
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
      cityTaxPercent: 0
    }

    this.state = {
      config
    };
  }

  onChangeConfig = (code: string, value) => {
    const { config } = this.state;
    config[code] = value;

    this.setState({ config }, () => {
      this.props.onChange('ebarimtConfig', config);
    });

  };

  onChangeCheckbox = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked)
  }

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  renderInput = (key: string, title?: string, description?: string, type?: string) => {
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

  renderCheckbox = (key: string, title?: string, description?: string) => {
    const { config } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={config[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentClass='checkbox'
        />
      </FormGroup>
    );
  }

  render() {
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <Block>
              <h4>{__("Main")}</h4>
              <BlockRow>
                {this.renderInput('companyName', 'company Name', '')}
                {this.renderInput('ebarimtUrl', 'ebarimt Url', '')}
                {this.renderInput('checkCompanyUrl', 'check Company Url', '')}
              </BlockRow>
            </Block>

            <Block>
              <h4>{__("Other")}</h4>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>{__('DISTRICTS')}</ControlLabel>
                  <FormControl
                    componentClass='select'
                    defaultValue={this.state.config.district}
                    options={DISTRICTS}
                    onChange={this.onChangeInput.bind(this, 'districtCode')}
                    required={true}
                  />
                </FormGroup>
                {this.renderInput('companyRD', 'company RD', '')}
                {this.renderInput('defaultGSCode', 'default GSCode', 'https://ebarimt.mn/img/buteegdehuun%20uilchilgeenii%20negdsen%20angilal.pdf')}
              </BlockRow>
            </Block>

            <Block>
              <h4>{__("Vat option")}</h4>
              <BlockRow>
                {this.renderCheckbox('hasVat', 'has Vat', '')}
                {this.renderInput('vatPercent', 'vat Percent', '', 'number')}
              </BlockRow>
            </Block
            >
            <Block>
              <h4>{__("cityTax option")}</h4>
              <BlockRow>
                {this.renderCheckbox('hasCitytax', 'has Citytax', '')}
                {this.renderInput('cityTaxPercent', 'cityTax Percent', '', 'number')}
              </BlockRow>
            </Block>

            <Block>
            </Block>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    )
  }
}

export default EbarimtConfig;