import React, { useState } from 'react';
import { __, ControlLabel, FormControl, FormGroup } from '@erxes/ui/src';
import { Block, BlockRow, FlexColumn, FlexItem } from '../../../styles';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { IPos } from '../../../types';
import { DISTRICTS } from '../../../constants';

type Props = {
  onChange: (name: 'ebarimtConfig', value: any) => void;
  pos?: IPos;
};

const EbarimtConfig = (props: Props) => {
  const { pos, onChange } = props;

  const [config, setConfig] = useState<any>(
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
          hasCopy: false,
        },
  );

  const onChangeConfig = (code: string, value) => {
    const newConfig = { ...config, [code]: value };

    setConfig(newConfig);
    onChange('ebarimtConfig', newConfig);
  };

  const onChangeCheckbox = (code: string, e) => {
    onChangeConfig(code, e.target.checked);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const renderInput = (
    key: string,
    title?: string,
    description?: string,
    type?: string,
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          value={config[key]}
          type={type || 'text'}
          onChange={onChangeInput.bind(this, key)}
          required={true}
        />
      </FormGroup>
    );
  };

  const renderCheckbox = (
    key: string,
    title?: string,
    description?: string,
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={config[key]}
          onChange={onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
      </FormGroup>
    );
  };

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>
            <h4>{__('Main')}</h4>
            <BlockRow>
              {renderInput('companyName', 'Company name', '')}
              {renderInput('ebarimtUrl', 'E-barimt URL', '')}
              {renderInput('checkCompanyUrl', 'Company check URL', '')}
            </BlockRow>
          </Block>

          <Block>
            <h4>{__('Other')}</h4>
            <BlockRow>
              <FormGroup>
                <ControlLabel>{__('Provice/District')}</ControlLabel>
                <FormControl
                  componentClass="select"
                  defaultValue={config.districtCode}
                  options={[
                    { value: '', label: 'Choose District' },
                    ...DISTRICTS,
                  ]}
                  onChange={onChangeInput.bind(this, 'districtCode')}
                  required={true}
                />
              </FormGroup>
              {renderInput('companyRD', 'Company register number', '')}
              {renderInput(
                'defaultGSCode',
                'default GSCode',
                'https://ebarimt.mn/img/buteegdehuun%20uilchilgeenii%20negdsen%20angilal.pdf',
              )}
            </BlockRow>
          </Block>

          <Block>
            <h4>{__('VAT')}</h4>
            <BlockRow>
              {renderCheckbox('hasVat', 'Has VAT', '')}
              {renderInput('vatPercent', 'VAT Percent', '', 'number')}
            </BlockRow>
          </Block>
          <Block>
            <h4>{__('UB city tax')}</h4>
            <BlockRow>
              {renderCheckbox('hasCitytax', 'Has UB city tax', '')}
              {renderInput(
                'cityTaxPercent',
                'UB city tax Percent',
                '',
                'number',
              )}
            </BlockRow>
          </Block>
          <Block />
          <Block>
            <h4>{__('Footer')}</h4>
            <BlockRow>
              {renderInput('footerText', 'Footer text', '')}
              {renderCheckbox('hasCopy', 'Has copy', '')}
            </BlockRow>
          </Block>
          <Block />
        </LeftItem>
      </FlexColumn>
    </FlexItem>
  );
};

export default EbarimtConfig;
