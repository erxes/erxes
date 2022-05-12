import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import React, { useState } from 'react';
import { ClientPortalConfig } from '../../types';
import Select from 'react-select-plus';
import { CONFIGURATIONS } from '../../constants';

type Props = {
  handleFormChange: (name: string, value: string) => void;
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

function General({
  twilioAccountSid,
  twilioAuthToken,
  twilioFromNumber,
  messageproApiKey,
  messageproPhoneNumber,
  content,
  handleFormChange
}: Props) {
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

  const [smsConfiguration, setSmsConfiguration] = useState<any>({});

  const renderTwilio = () => {
    if (!(smsConfiguration === 'Twilio')) {
      return;
    }

    return (
      <>
        {renderControl({
          label: 'TWILIO ACCOUNT SID',
          formValueName: 'twilioAccountSid',
          formValue: twilioAccountSid
        })}

        {renderControl({
          label: 'TWILIO AUTH TOKEN',
          formValueName: 'twilioAuthToken',
          formValue: twilioAuthToken
        })}

        {renderControl({
          label: 'TWILIO FROM NUMBER',
          formValueName: 'twilioFromNumber',
          formValue: twilioFromNumber
        })}

        {renderControl({
          label: 'CONTENT',
          formValueName: 'content',
          formValue: content
        })}
      </>
    );
  };

  const renderMessagePro = () => {
    if (!(smsConfiguration === 'MessagePro')) {
      return;
    }
    return (
      <>
        {renderControl({
          label: 'MESSAGEPRO API KEY',
          formValueName: 'messageproApiKey',
          formValue: messageproApiKey
        })}

        {renderControl({
          label: 'MESSAGEPRO PHONE NUMBER',
          formValueName: 'messageproPhoneNumber',
          formValue: messageproPhoneNumber
        })}

        {renderControl({
          label: 'CONTENT',
          formValueName: 'content',
          formValue: content
        })}
      </>
    );
  };

  const onChangeConfiguration = (value: any) => {
    setSmsConfiguration(value.value);
    handleFormChange('smsConfiguration', value.value);
  };

  return (
    <>
      <FormGroup>
        <ControlLabel>Sms Configuration</ControlLabel>
        <Select
          placeholder="Choose a configuration"
          value={smsConfiguration}
          options={CONFIGURATIONS}
          name="SMS Configuration"
          onChange={onChangeConfiguration}
        />
      </FormGroup>
      {renderTwilio()}
      {renderMessagePro()}
    </>
  );
}

export default General;
