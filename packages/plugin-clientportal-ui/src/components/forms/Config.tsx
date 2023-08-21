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
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';

import { CONFIGURATIONS } from '../../constants';
import { BlockRow, ToggleWrap } from '../../styles';
import { ClientPortalConfig } from '../../types';
import PasswordConfig from './PasswordConfig';
import { Formgroup } from '@erxes/ui/src/components/form/styles';

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
  googleClientId,
  googleRedirectUri,
  googleClientSecret,
  facebookAppId,
  erxesAppToken,
  otpConfig,
  mailConfig,
  name,
  manualVerificationConfig,
  passwordVerificationConfig,
  tokenPassMethod = 'cookie',
  tokenExpiration = 1,
  refreshTokenExpiration = 7,
  handleFormChange
}: Props) {
  const [otpEnabled, setOtpEnabled] = useState<boolean>(
    otpConfig ? true : false
  );

  const [mailEnabled, setMailEnabled] = useState<boolean>(
    mailConfig ? true : false
  );

  const [manualVerificationEnabled, setManualVerificationEnabled] = useState<
    boolean
  >(manualVerificationConfig ? true : false);

  const [userIds] = useState<string[]>(
    manualVerificationConfig ? manualVerificationConfig.userIds : []
  );

  const [verifyCompany, setVerifyCompany] = useState<boolean>(
    manualVerificationConfig ? manualVerificationConfig.verifyCompany : false
  );

  const [verifyCustomer, setVerifyCustomer] = useState<boolean>(
    manualVerificationConfig ? manualVerificationConfig.verifyCustomer : false
  );

  const onSelectUsers = values => {
    handleFormChange('manualVerificationConfig', {
      userIds: values,
      verifyCompany,
      verifyCustomer
    });
  };

  const onChangeToggle = (type: string, value: boolean) => {
    if (type === 'otpEnabled') {
      setOtpEnabled(value);

      if (!value) {
        handleFormChange('otpConfig', null);
      } else {
        handleFormChange('otpConfig', {
          smsTransporterType: '',
          codeLength: 4,
          content: 'Your verification code is {{ code }}',
          expireAfter: 1,
          loginWithOTP: false
        });
      }
    }

    if (type === 'mailEnabled') {
      setMailEnabled(value);

      if (!value) {
        handleFormChange('mailConfig', null);
      }
    }

    if (type === 'manualVerificationEnabled') {
      setManualVerificationEnabled(value);

      if (!value) {
        handleFormChange('manualVerificationConfig', null);
      } else {
        handleFormChange('manualVerificationConfig', {
          userIds: [],
          verifyCustomer: false,
          verifyCompany: false
        });
      }
    }

    if (type === 'verifyCompany') {
      setVerifyCompany(value);

      handleFormChange('manualVerificationConfig', {
        userIds,
        verifyCompany: value,
        verifyCustomer
      });
    }

    if (type === 'verifyCustomer') {
      setVerifyCustomer(value);

      handleFormChange('manualVerificationConfig', {
        userIds,
        verifyCompany,
        verifyCustomer: value
      });
    }
  };

  const onChangeConfiguration = option => {
    handleFormChange('otpConfig', {
      ...otpConfig,
      smsTransporterType: option.value
    });
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
    const obj = otpConfig || {
      content: '',
      codeLength: 4,
      smsTransporterType: 'messagePro',
      loginWithOTP: false,
      expireAfter: 1
    };
    const handleChange = e => {
      const key = e.currentTarget.id;
      const value = (e.currentTarget as HTMLInputElement).value;

      obj[key] = value;

      if (key === 'content') {
        let content = value;

        const base = ' {{ code }} ';
        const regex = new RegExp('[sS]*?' + base + '[sS]*?', 'i');

        if (!regex.test(value)) {
          content = content.replace(/{{ code }}/g, base);
          if (content.search(base) === -1) {
            content = base;
          }

          content = content.replace('  ', ' ');
        }

        obj.content = content;
      }

      if (['codeLength', 'expireAfter'].includes(key)) {
        obj[key] = Number(value);
      }

      if (key === 'loginWithOTP') {
        obj[key] = e.currentTarget.checked;
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

            <FormGroup>
              <ControlLabel required={true}>OTP expiry</ControlLabel>
              <p>{'OTP expiration duration (min)'}</p>
              <FlexContent>
                <FormControl
                  id="expireAfter"
                  name="expireAfter"
                  value={obj.expireAfter}
                  onChange={handleChange}
                  type={'number'}
                  min={1}
                  max={10}
                />
              </FlexContent>
            </FormGroup>

            <FormGroup>
              <ControlLabel>Login with OTP</ControlLabel>
              <p>Enable this option to accept customer login with OTP</p>
              <FlexContent>
                <FormControl
                  id="loginWithOTP"
                  name="loginWithOTP"
                  checked={obj.loginWithOTP}
                  onChange={handleChange}
                  componentClass="checkbox"
                />
              </FlexContent>
            </FormGroup>
          </>
        )}
      </CollapseContent>
    );
  };

  const renderMailConfig = () => {
    const obj = mailConfig || {
      registrationContent: `Hello <br /><br />Your verification link is {{ link }}.<br /><br />Thanks<br />${name}`,
      invitationContent: `Hello <br /><br />Your verification link is {{ link }}.<br />  Your password is: {{ password }} . Please change your password after you login. <br /><br />Thanks <br />${name}`,
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

  const renderManualVerification = () => {
    return (
      <CollapseContent
        title={__('Manual verification')}
        compact={true}
        open={false}
      >
        <ToggleWrap>
          <FormGroup>
            <ControlLabel>Enable</ControlLabel>
            <Toggle
              checked={manualVerificationEnabled}
              onChange={() =>
                onChangeToggle(
                  'manualVerificationEnabled',
                  !manualVerificationEnabled
                )
              }
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </FormGroup>
        </ToggleWrap>
        {manualVerificationEnabled && (
          <>
            <FormGroup>
              <ControlLabel required={true}>{__('Team members')}</ControlLabel>

              <p>{__('Select team members who can verify')}</p>
              <SelectTeamMembers
                label="Select team members"
                name="userIds"
                initialValue={userIds}
                onSelect={onSelectUsers}
                multi={true}
              />
            </FormGroup>

            <ToggleWrap>
              <FormGroup>
                <ControlLabel>Verify customer</ControlLabel>
                <Toggle
                  checked={verifyCustomer}
                  onChange={() =>
                    onChangeToggle('verifyCustomer', !verifyCustomer)
                  }
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>
                  }}
                />
              </FormGroup>
            </ToggleWrap>

            <ToggleWrap>
              <FormGroup>
                <ControlLabel>Verify company</ControlLabel>
                <Toggle
                  checked={verifyCompany}
                  onChange={() =>
                    onChangeToggle('verifyCompany', !verifyCompany)
                  }
                  icons={{
                    checked: <span>Yes</span>,
                    unchecked: <span>No</span>
                  }}
                />
              </FormGroup>
            </ToggleWrap>
          </>
        )}
      </CollapseContent>
    );
  };

  return (
    <>
      <CollapseContent title="User Authentication" compact={true} open={false}>
        <BlockRow>
          <Formgroup>
            <ControlLabel>Token pass method</ControlLabel>
            <p>
              It is recommended to use cookies, if hosting the client portal on
              a different domain use bearer token
            </p>
            <FormControl
              componentClass="select"
              placeholder="select"
              value={tokenPassMethod}
              onChange={(e: any) =>
                handleFormChange('tokenPassMethod', e.currentTarget.value)
              }
            >
              <option value="cookie">Cookie</option>
              <option value="header">Bearer token</option>
            </FormControl>
          </Formgroup>

          <Formgroup>
            <ControlLabel>Token expiration duration</ControlLabel>
            <p>
              In order to be a more secure, it is recommended to set a short
              expiration duration.
            </p>
            <FormControl
              componentClass="input"
              placeholder="token expiration duration"
              type="number"
              min={1}
              max={5}
              value={tokenExpiration}
              onChange={(e: any) =>
                handleFormChange(
                  'tokenExpiration',
                  Number(e.currentTarget.value)
                )
              }
            />
          </Formgroup>

          <Formgroup>
            <ControlLabel>Refresh Token expiration duration</ControlLabel>
            <p>
              Refresh token expiration duration can be set to a longer duration.
            </p>
            <FormControl
              componentClass="input"
              placeholder="refresh token expiration duration"
              type="number"
              min={7}
              max={30}
              value={refreshTokenExpiration}
              onChange={(e: any) =>
                handleFormChange(
                  'refreshTokenExpiration',
                  Number(e.currentTarget.value)
                )
              }
            />
          </Formgroup>
        </BlockRow>
      </CollapseContent>
      {renderOtp()}
      {renderMailConfig()}
      <PasswordConfig
        config={passwordVerificationConfig}
        onChange={handleFormChange}
      />
      {renderManualVerification()}

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
        {renderControl({
          label: 'Google Client Id',
          formValueName: 'googleClientId',
          formValue: googleClientId
        })}
        {renderControl({
          label: 'Google Client Secret',
          formValueName: 'googleClientSecret',
          formValue: googleClientSecret
        })}
        {renderControl({
          label: 'Google Client Redirect Uri',
          formValueName: 'googleRedirectUri',
          formValue: googleRedirectUri
        })}
      </CollapseContent>
      <CollapseContent
        title={__('Facebook Application Credentials')}
        compact={true}
        open={false}
      >
        {renderControl({
          label: 'Facebook App Id',
          formValueName: 'facebookAppId',
          formValue: facebookAppId
        })}
      </CollapseContent>
      <CollapseContent
        title={__('Erxes App Token')}
        compact={true}
        open={false}
      >
        {renderControl({
          label: 'Erxes App Token',
          formValueName: 'erxesAppToken',
          formValue: erxesAppToken
        })}
      </CollapseContent>
    </>
  );
}

export default General;
