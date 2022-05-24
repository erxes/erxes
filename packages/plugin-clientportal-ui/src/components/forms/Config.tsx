import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import React, { useState } from 'react';
import { ClientPortalConfig, OTPConfig } from '../../types';
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
  const [config, setConfig] = useState<OTPConfig>(otpConfig);

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
    if (!config || !config.smsTransporterType) {
      return;
    }

    const handleChange = (e: React.FormEvent) => {
      let content = (e.currentTarget as HTMLInputElement).value;

      if (!content || !content.length) {
        content = '{{code}}';
      }

      setConfig({ ...config, content });

      handleFormChange('otpConfig', config);
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Content</ControlLabel>
          <p>OTP message body</p>
          <FlexContent>
            <FormControl
              name="content"
              value={config.content}
              onChange={handleChange}
            />
          </FlexContent>
        </FormGroup>
      </>
    );
  };

  const onChangeConfiguration = option => {
    setConfig({ ...config, smsTransporterType: option.value });
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>Sms Configuration</ControlLabel>
        <Select
          placeholder="Choose a configuration"
          value={config.smsTransporterType}
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
