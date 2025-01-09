import React, { useState } from 'react';
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  SelectWithSearch,
  Textarea,
} from '@erxes/ui/src';
import { Block, BlockRow, FlexColumn, FlexItem } from '../../../styles';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { IPos } from '../../../types';

const ebarimtProductRules = `
  query ebarimtProductRules(
    $searchValue: String,
    $kind: String,
  ) {
    ebarimtProductRules(
      searchValue: $searchValue,
      kind: $kind,
    ) {
      _id
      title
    }
  }
`;


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
        headerText: '',
        footerText: '',
        hasCopy: false,
      }
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
    textarea?: boolean
  ) => {
    const Control = textarea ? Textarea : FormControl;
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <Control
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
    description?: string
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{title || key}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={config[key]}
          onChange={onChangeCheckbox.bind(this, key)}
          componentclass="checkbox"
        />
      </FormGroup>
    );
  };

  const generateRuleOptions = (array) => array.map(item => ({
    value: item._id,
    label: item.title || ''
  }));

  return (
    <FlexItem>
      <FlexColumn>
        <LeftItem>
          <Block>
            <h4>{__('Main')}</h4>
            <BlockRow>
              {renderInput('companyName', 'company Name')}
              {renderInput('ebarimtUrl', 'ebarimt Url')}
              {renderInput('checkTaxpayerUrl', 'check taxpayer Url')}
            </BlockRow>
          </Block>

          <Block>
            <h4>{__('Other')}</h4>
            <BlockRow>
              {renderInput('companyRD', 'companyRD', '')}
              {renderInput('merchantTin', 'merchantTin', '')}
              {renderInput('posNo', 'posNo', '')}
            </BlockRow>
            <BlockRow>
              {renderInput('districtCode', 'districtCode', '')}
              {renderInput('branchNo', 'branchNo', '')}
              {renderInput('defaultGSCode', 'defaultGSCode', '')}
            </BlockRow>
          </Block>

          <Block>
            <h4>{__('VAT')}</h4>
            <BlockRow>
              {renderCheckbox('hasVat', 'Has VAT', '')}
              {renderInput('vatPercent', 'VAT Percent', '', 'number')}
            </BlockRow>
            {config.hasVat && (
              <BlockRow>
                <FormGroup>
                  <ControlLabel>Another rules of products on vat</ControlLabel>
                  <SelectWithSearch
                    label={'reverseVatRules'}
                    queryName="ebarimtProductRules"
                    name={'reverseVatRules'}
                    initialValue={config['reverseVatRules']}
                    generateOptions={generateRuleOptions}
                    onSelect={ids => {
                      onChangeConfig("reverseVatRules", ids);
                    }}
                    filterParams={{ kind: 'vat' }}
                    customQuery={ebarimtProductRules}
                    multi={true}
                  />
                </FormGroup>
              </BlockRow>
            ) || <></>}
          </Block>
          <Block>
            <h4>{__('UB city tax')}</h4>
            <BlockRow>
              {renderCheckbox('hasCitytax', 'Has UB city tax', '')}
              {renderInput(
                'cityTaxPercent',
                'UB city tax Percent',
                '',
                'number'
              )}
            </BlockRow>
            {!config.hasCitytax && (
              <BlockRow>
                <FormGroup>
                  <ControlLabel>Another rules of products on citytax</ControlLabel>
                  <SelectWithSearch
                    label={'reverseCtaxRules'}
                    queryName="ebarimtProductRules"
                    name={'reverseCtaxRules'}
                    initialValue={config['reverseCtaxRules']}
                    generateOptions={generateRuleOptions}
                    onSelect={ids => {
                      onChangeConfig("reverseCtaxRules", ids);
                    }}
                    filterParams={{ kind: 'ctax' }}
                    customQuery={ebarimtProductRules}
                    multi={true}
                  />
                </FormGroup>
              </BlockRow>
            ) || <></>}
          </Block>
          <Block />
          <Block>
            <h4>{__('UI Config')}</h4>
            <BlockRow>
              {renderInput('headerText', 'Header text', '', 'text', true)}
              {renderInput('footerText', 'Footer text', '', 'text', true)}
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
