import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { ClientPortalConfig } from '../../types';
import Select from 'react-select-plus';
import { CONFIGURATIONS } from '../../constants';

type Props = {
  handleFormChange: (name: string, value: any) => void;
} & ClientPortalConfig;

type ControlItem = {
  required?: boolean;
  label: string;
  subtitle?: string;
  formValueName: string;
  formValue?: string | object;
  placeholder?: string;
  formProps?: any;
};

function General({ googleCredentials, otpConfig, handleFormChange }: Props) {
  function renderControl({
    required,
    label,
    subtitle,
    formValueName,
    formValue,
    placeholder,
    formProps
  }: ControlItem) {
    const handleChange = (e: React.FormEvent) => {
      handleFormChange(
        formValueName,
        (e.currentTarget as HTMLInputElement).value
      );
    };

    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        {subtitle && <p>{subtitle}</p>}
        <FlexContent>
          <FormControl
            {...formProps}
            name={formValueName}
            value={formValue}
            placeholder={placeholder}
            onChange={handleChange}
          />
        </FlexContent>
      </FormGroup>
    );
  }

  const renderContent = () => {
    if (!otpConfig || !otpConfig.smsTransporterType) {
      return;
    }

    const handleChange = (e: React.FormEvent) => {
      let obj = otpConfig;

      const key = e.currentTarget.id;
      const value = (e.currentTarget as HTMLInputElement).value;

      obj[key] = value;

      if (key === 'content') {
        let content = value;

        if (!content || !content.length) {
          content = '{{code}}';
        }
        obj.content = content;
      }

      if (key === 'codeLength') {
        obj[key] = parseInt(value);
      }

      handleFormChange('otpConfig', otpConfig);
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Content</ControlLabel>
          <p>OTP message body</p>
          <FlexContent>
            <FormControl
              id="content"
              name="content"
              value={otpConfig.content}
              onChange={handleChange}
            />
          </FlexContent>
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>OTP code length</ControlLabel>
          <p>OTP code length</p>
          <FlexContent>
            <FormControl
              id="codeLength"
              name="codeLength"
              value={otpConfig.codeLength}
              onChange={handleChange}
              type={'number'}
              min={4}
            />
          </FlexContent>
        </FormGroup>
      </>
    );
  };

  const onChangeConfiguration = option => {
    // setConfig({ ...config, smsTransporterType: option.value });
    otpConfig.smsTransporterType = option.value;
    handleFormChange('otpConfig', otpConfig);
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>Sms Configuration</ControlLabel>
        <Select
          placeholder="Choose a configuration"
          value={otpConfig.smsTransporterType}
          options={CONFIGURATIONS}
          name="SMS Configuration"
          onChange={onChangeConfiguration}
        />
      </FormGroup>
      {renderContent()}

      {renderControl({
        label: 'Google Application Credentials',
        formValueName: 'googleCredentials',
        formValue: googleCredentials
      })}
    </>
  );
}

export default General;
