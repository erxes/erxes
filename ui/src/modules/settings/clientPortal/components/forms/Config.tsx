import { FlexContent } from 'erxes-ui/lib/layout/styles';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import React from 'react';
import { ClientPortalConfig } from '../../types';

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
  googleCredentials,
  twilioAccountSid,
  twilioAuthToken,
  twilioFromNumber,
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
        label: 'Google Application Credentials',
        formValueName: 'googleCredentials',
        formValue: googleCredentials
      })}
    </>
  );
}

export default General;
