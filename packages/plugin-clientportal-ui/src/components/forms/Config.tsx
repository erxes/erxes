import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Toggle from '@erxes/ui/src/components/Toggle';
import EditorCK from '@erxes/ui/src/containers/EditorCK';
import { FlexContent } from '@erxes/ui/src/layout/styles';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import Select from 'react-select-plus';

import { CONFIGURATIONS } from '../../constants';
import { ToggleWrap } from '../../styles';
import { ClientPortalConfig } from '../../types';

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

function General({
  googleCredentials,
  otpConfig,
  mailConfig,
  name,
  handleFormChange
}: Props) {
  const [otpEnabled, setOtpEnabled] = useState<boolean>(
    otpConfig ? true : false
  );

  const [mailEnabled, setMailEnabled] = useState<boolean>(
    mailConfig ? true : false
  );

  const onChangeToggle = (name: string, value: boolean) => {
    if (name === 'otpEnabled') {
      setOtpEnabled(value);

      if (!value) {
        handleFormChange('otpConfig', null);
      } else {
        handleFormChange('otpConfig', {
          smsTransporterType: '',
          codeLength: 4,
          content: 'Your verification code is {{code}}'
        });
      }
    }

    if (name === 'mailEnabled') {
      setMailEnabled(value);

      if (!value) {
        handleFormChange('mailConfig', null);
      }
    }
  };

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

  const renderOtp = () => {
    let obj = otpConfig || {
      content: '',
      codeLength: 4,
      smsTransporterType: 'messagePro'
    };
    const handleChange = (e: React.FormEvent) => {
      const key = e.currentTarget.id;
      const value = (e.currentTarget as HTMLInputElement).value;

      obj[key] = value;

      if (key === 'content') {
        let content = value;

        const base = ' {{code}} ';
        const regex = new RegExp('[sS]*?' + base + '[sS]*?', 'i');

        if (!regex.test(value)) {
          content = content.replace(/{{code}}/g, base);
          if (content.search(base) === -1) {
            content = base;
          }

          content = content.replace('  ', ' ');
        }

        obj.content = content;
      }

      if (key === 'codeLength') {
        obj[key] = parseInt(value);
      }

      handleFormChange('otpConfig', obj);
    };

    return (
      <CollapseContent title={__('Mobile OTP')} compact={true} open={false}>
        <ToggleWrap>
          <FormGroup>
            <ControlLabel>Enable OTP config</ControlLabel>
            <Toggle
              checked={otpEnabled}
              onChange={() => onChangeToggle('otpEnabled', !otpEnabled)}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </FormGroup>
        </ToggleWrap>

        {otpEnabled && (
          <>
            <FormGroup>
              <ControlLabel>Sms Configuration</ControlLabel>
              <Select
                placeholder="Choose a configuration"
                value={obj.smsTransporterType}
                options={CONFIGURATIONS}
                name="SMS Configuration"
                onChange={onChangeConfiguration}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel required={true}>Content</ControlLabel>
              <p>OTP message body</p>
              <FlexContent>
                <FormControl
                  id="content"
                  name="content"
                  value={obj.content}
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
                  value={obj.codeLength}
                  onChange={handleChange}
                  type={'number'}
                  min={4}
                />
              </FlexContent>
            </FormGroup>
          </>
        )}
      </CollapseContent>
    );
  };

  const renderMailConfig = () => {
    let obj = mailConfig || {
      registrationContent: `Hello <br /><br />Your verification link is {{link}}.<br /><br />Thanks<br />${name}`,
      invitationContent: `Hello <br /><br />Your verification link is {{link}}.<br />  Your password is: {{password}} . Please change your password after you login. <br /><br />Thanks <br />${name}`,
      subject: `${name} - invitation`
    };

    const onChangeSubject = (e: React.FormEvent) => {
      obj.subject = (e.currentTarget as HTMLInputElement).value;
      handleFormChange('mailConfig', obj);
    };

    const onEditorChange = e => {
      const value = e.editor.getData();
      const editorNumber: number =
        e.editor.name && e.editor.name.replace(/[^\d.]/g, '');

      if (editorNumber % 2 !== 0) {
        obj.registrationContent = value;
      } else {
        obj.invitationContent = value;
      }

      handleFormChange('mailConfig', obj);
    };

    return (
      <CollapseContent
        title={__('Confirmation mail settings')}
        compact={true}
        open={false}
      >
        <ToggleWrap>
          <FormGroup>
            <ControlLabel>Enable mail config</ControlLabel>
            <Toggle
              checked={mailEnabled}
              onChange={() => onChangeToggle('mailEnabled', !mailEnabled)}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </FormGroup>
        </ToggleWrap>
        {mailEnabled && (
          <>
            <FormGroup>
              <ControlLabel required={true}>Subject</ControlLabel>
              <p>Invitation mail subject</p>
              <FlexContent>
                <FormControl
                  id="subject"
                  name="subject"
                  value={obj.subject}
                  onChange={onChangeSubject}
                />
              </FlexContent>
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>
                Registration Mail Content
              </ControlLabel>
              <p>Registration mail body</p>
              <FlexContent>
                <EditorCK
                  content={obj.registrationContent || ''}
                  onChange={onEditorChange}
                  height={300}
                  name={'registrationContent'}
                  insertItems={{
                    items: [
                      {
                        value: 'link',
                        name: 'Link'
                      }
                    ],
                    title: 'Attributes',
                    label: 'Attributes'
                  }}
                />
              </FlexContent>
            </FormGroup>

            <FormGroup>
              <ControlLabel required={true}>
                Invitation Mail Content
              </ControlLabel>
              <p>Invitation mail body</p>
              <FlexContent>
                <EditorCK
                  content={obj.invitationContent || ''}
                  onChange={onEditorChange}
                  height={300}
                  name={'invitationContent'}
                  insertItems={{
                    items: [
                      {
                        value: 'link',
                        name: 'Link'
                      },
                      {
                        value: 'password',
                        name: 'Password'
                      }
                    ],
                    title: 'Attributes',
                    label: 'Attributes'
                  }}
                />
              </FlexContent>
            </FormGroup>
          </>
        )}
      </CollapseContent>
    );
  };

  const onChangeConfiguration = option => {
    otpConfig && (otpConfig.smsTransporterType = option.value);
    handleFormChange('otpConfig', otpConfig);
  };

  return (
    <>
      {renderOtp()}
      {renderMailConfig()}

      <CollapseContent
        title={__('Google Application Credentials')}
        compact={true}
        open={false}
      >
        {renderControl({
          label: 'Google Application Credentials',
          formValueName: 'googleCredentials',
          formValue: googleCredentials
        })}
      </CollapseContent>
    </>
  );
}

export default General;
