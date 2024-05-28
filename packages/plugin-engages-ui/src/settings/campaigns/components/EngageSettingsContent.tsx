import { Alert, __ } from 'coreui/utils';
import { ContentBox, FlexRow } from '@erxes/ui-settings/src/styles';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { Recipient, Recipients } from '@erxes/ui-engage/src/styles';

import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import { FormControl } from '@erxes/ui/src/components/form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IConfigsMap } from '@erxes/ui-settings/src/general/types';
import Icon from '@erxes/ui/src/components/Icon';
import Info from '@erxes/ui/src/components/Info';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import { Verify } from '@erxes/ui-settings/src/general/components/styles';
import Select from 'react-select';

type Props = {
  configsMap: IConfigsMap;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  verifyEmail: (email: string, callback) => void;
  removeVerifiedEmail: (email: string) => void;
  sendTestEmail: (from: string, to: string, content: string) => void;
  verifiedEmails: string[];
};

type State = {
  emailServiceType: string;
  secretAccessKey?: string;
  accessKeyId?: string;
  region?: string;
  emailToVerify?: string;
  testFrom?: string;
  testTo?: string;
  testContent?: string;
  configSet?: string;
  emailVerificationType?: string;

  telnyxApiKey?: string;
  telnyxPhone?: string;
  telnyxProfileId?: string;
  socketLabsResult?: any;
};

type CommonFields =
  | 'emailServiceType'
  | 'emailToVerify'
  | 'testFrom'
  | 'testTo'
  | 'testContent'
  | 'telnyxApiKey'
  | 'telnyxPhone'
  | 'telnyxProfileId';

class EngageSettingsContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { configsMap } = props;

    this.state = {
      emailServiceType: configsMap.emailServiceType || 'ses',
      secretAccessKey: configsMap.secretAccessKey || '',
      accessKeyId: configsMap.accessKeyId || '',
      region: configsMap.region || '',
      configSet: configsMap.configSet || '',
      emailVerificationType: configsMap.emailVerificationType || '',
      telnyxApiKey: configsMap.telnyxApiKey || '',
      telnyxPhone: configsMap.telnyxPhone || '',
      telnyxProfileId: configsMap.telnyxProfileId || '',
      socketLabsResult: undefined,
    };
  }

  generateDoc = (values) => {
    values.emailServiceType = this.state.emailServiceType;
    return { configsMap: values };
  };

  onChangeCommon = (name: CommonFields, e) => {
    this.setState({ [name]: e.currentTarget.value });
  };

  onVerifyEmail = () => {
    const { emailToVerify } = this.state;

    const callback = (res) => {
      this.setState({ socketLabsResult: res });
    };

    if (emailToVerify) {
      return this.props.verifyEmail(emailToVerify, callback);
    }

    return Alert.error('Write your email to verify!');
  };

  onSendTestEmail = () => {
    const { testFrom, testTo, testContent } = this.state;

    this.props.sendTestEmail(testFrom || '', testTo || '', testContent || '');
  };

  onRemoveVerifiedEmail = (email: string) => {
    this.props.removeVerifiedEmail(email);
  };

  renderVerifiedEmails = () => {
    const { verifiedEmails } = this.props;

    if (verifiedEmails.length === 0) {
      return;
    }

    return (
      <>
        <h4>{__('Verified emails')}:</h4>

        <Recipients>
          {verifiedEmails.map((email, index) => (
            <Recipient key={index}>
              {email}
              <span onClick={this.onRemoveVerifiedEmail.bind(this, email)}>
                <Icon icon='times' />
              </span>
            </Recipient>
          ))}
        </Recipients>
      </>
    );
  };

  renderSocketLabsConfigs = (formProps) => {
    const { configsMap } = this.props;
    if (this.state.emailServiceType !== 'socketLabs') {
      return null;
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>Server ID</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name='socketLabsServerId'
            defaultValue={configsMap.socketLabsServerId}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>API Key</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name='socketLabsApiKey'
            defaultValue={configsMap.socketLabsApiKey}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Username</ControlLabel>
          <FormControl
            {...formProps}
            name='socketLabsUsername'
            defaultValue={configsMap.socketLabsUsername}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>SMTP Password</ControlLabel>
          <FormControl
            {...formProps}
            name='socketLabsPassword'
            defaultValue={configsMap.socketLabsPassword}
          />
        </FormGroup>
      </>
    );
  };

  renderSesConfigs = (formProps) => {
    const { configsMap } = this.props;
    console.log('SSSSS ', this.state.emailServiceType);
    if (this.state.emailServiceType !== 'ses') {
      console.log('nullll');
      return null;
    }

    console.log('render pro');

    return (
      <>
        <FlexRow $alignItems='flex-start' $justifyContent='space-between'>
          <FormGroup>
            <ControlLabel>AWS SES Access key ID</ControlLabel>
            <FormControl
              {...formProps}
              max={140}
              name='accessKeyId'
              defaultValue={configsMap.accessKeyId}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>AWS SES Secret access key</ControlLabel>
            <FormControl
              {...formProps}
              max={140}
              name='secretAccessKey'
              defaultValue={configsMap.secretAccessKey}
            />
          </FormGroup>
        </FlexRow>
        <FlexRow $alignItems='flex-start' $justifyContent='space-between'>
          <FormGroup>
            <ControlLabel>AWS SES Region</ControlLabel>
            <FormControl
              {...formProps}
              max={140}
              name='region'
              defaultValue={configsMap.region}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>AWS SES Config set</ControlLabel>
            <FormControl
              {...formProps}
              max={140}
              name='configSet'
              defaultValue={configsMap.configSet}
            />
          </FormGroup>
        </FlexRow>
      </>
    );
  };

  renderSocketlabsDomain = () => {
    if (this.state.emailServiceType !== 'socketLabs') {
      return null;
    }

    return (
      <CollapseContent
        beforeTitle={<Icon icon='shield-check' />}
        transparent={true}
        title={__('Domain management')}
      >
        {this.renderVerifiedEmails()}

        <Verify>
          <ControlLabel required={true}>Domain</ControlLabel>
          <FormControl
            type='email'
            onChange={this.onChangeCommon.bind(this, 'emailToVerify')}
          />

          <Button
            onClick={this.onVerifyEmail}
            btnStyle='success'
            icon='check-circle'
          >
            Verify
          </Button>
        </Verify>
      </CollapseContent>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { configsMap, renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const { emailServiceType } = this.state;

    const emailServices = [
      { label: 'Amazon Simple Email Service', value: 'ses' },
      { label: 'SocketLabs Email', value: 'socketLabs' },
    ];
    const currentType = emailServices.find(
      (item) => item.value === emailServiceType
    );

    return (
      <>
        <Info>
          <p>
            {__(
              `${currentType?.label} enables you to send and receive email using a reliable and scalable email platform. Set up your custom ${currentType?.label.toLowerCase()} account`
            ) + '.'}
          </p>
          <a
            target='_blank'
            href='https://docs.erxes.io/conversations'
            rel='noopener noreferrer'
          >
            {__(`Learn more about ${currentType?.label} configuration`)}
          </a>
        </Info>
        <FormGroup>
          <ControlLabel>{'Email service provider'}</ControlLabel>
          <Select
            options={emailServices}
            value={emailServices.find(
              (item) => item.value === this.state.emailServiceType
            )}
            isClearable={false}
            isSearchable={false}
            onChange={(e: any) => {
              console.log('e.  ', e.value);
              this.setState({ emailServiceType: e.value });
            }}
          />
        </FormGroup>
        {this.renderSesConfigs(formProps)}
        {this.renderSocketLabsConfigs(formProps)}

        <FormGroup>
          <ControlLabel>Unverified emails limit</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name='unverifiedEmailsLimit'
            defaultValue={configsMap.unverifiedEmailsLimit || 100}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Allowed email skip limit</ControlLabel>
          <p>
            The number of times that each customer can skip to open or click
            campaign emails. If this limit is exceeded, then the customer will
            automatically set to
            <strong> unsubscribed </strong>mode.
          </p>
          <FormControl
            {...formProps}
            name='allowedEmailSkipLimit'
            defaultValue={configsMap.allowedEmailSkipLimit || 10}
          />
        </FormGroup>

        {/* <FormGroup>
            <ControlLabel>Customer limit per auto SMS campaign</ControlLabel>
            <p>
              The maximum number of customers that can receive auto SMS campaign
              per each runtime.
            </p>
            <FormControl
              {...formProps}
              name="smsLimit"
              defaultValue={configsMap.smsLimit || 0}
              min={50}
              max={100}
            />
          </FormGroup> */}

        <ModalFooter>
          {renderButton({
            name: 'configsMap',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.configsMap,
          })}
        </ModalFooter>
      </>
    );
  };

  renderSocketLabsResult() {
    if (!this.state.socketLabsResult) {
      return null;
    }

    
  }

  render() {
    return (
      <ContentBox id={'EngageSettingsMenu'}>
        <CollapseContent
          beforeTitle={<Icon icon='settings' />}
          transparent={true}
          title='General settings'
        >
          <Form renderContent={this.renderContent} />
        </CollapseContent>

        <CollapseContent
          beforeTitle={<Icon icon='shield-check' />}
          transparent={true}
          title={__('Verify the email addresses that you send email from')}
        >
          {this.renderVerifiedEmails()}

          <Verify>
            <ControlLabel required={true}>Email</ControlLabel>
            <FormControl
              type='email'
              onChange={this.onChangeCommon.bind(this, 'emailToVerify')}
            />

            <Button
              onClick={this.onVerifyEmail}
              btnStyle='success'
              icon='check-circle'
            >
              Verify
            </Button>
          </Verify>
        </CollapseContent>
        <CollapseContent
          beforeTitle={<Icon icon='envelope-upload' />}
          transparent={true}
          title={__('Send your first testing email')}
        >
          <FlexRow $alignItems='flex-start' $justifyContent='space-between'>
            <FormGroup>
              <ControlLabel>From</ControlLabel>
              <FormControl
                placeholder='from@email.com'
                onChange={this.onChangeCommon.bind(this, 'testFrom')}
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>To</ControlLabel>
              <FormControl
                placeholder='to@email.com'
                onChange={this.onChangeCommon.bind(this, 'testTo')}
              />
            </FormGroup>
          </FlexRow>
          <FormGroup>
            <ControlLabel>Content</ControlLabel>
            <FormControl
              placeholder={__('Write your content') + '...'}
              componentclass='textarea'
              onChange={this.onChangeCommon.bind(this, 'testContent')}
            />
          </FormGroup>

          <ModalFooter>
            <Button
              btnStyle='success'
              icon='message'
              onClick={this.onSendTestEmail}
            >
              Send test email
            </Button>
          </ModalFooter>
        </CollapseContent>
      </ContentBox>
    );
  }
}

export default EngageSettingsContent;
