import { Alert, __, Tabs, TabTitle } from '@erxes/ui/src';
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
import Select from 'react-select-plus';
import styled from 'styled-components';

const Container = styled.div`
  margin: 10px 0;
`;

type Props = {
  configsMap: IConfigsMap;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  verifyEmail: (email: string) => void;
  removeVerifiedEmail: (email: string) => void;
  sendTestEmail: (from: string, to: string, content: string) => void;
  verifiedEmails: string[];
};

type State = {
  secretAccessKey?: string;
  accessKeyId?: string;
  region?: string;
  emailToVerify?: string;
  testFrom?: string;
  testTo?: string;
  testContent?: string;
  configSet?: string;
  emailVerificationType?: string;
  trueMailApiKey?: string;
  telnyxApiKey?: string;
  telnyxPhone?: string;
  telnyxProfileId?: string;
  defaultEmailService?: string;
  selectedTab?: string;
};

type CommonFields =
  | 'emailToVerify'
  | 'testFrom'
  | 'testTo'
  | 'testContent'
  | 'telnyxApiKey'
  | 'telnyxPhone'
  | 'telnyxProfileId'
  | 'defaultEmailService';

class EngageSettingsContent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { configsMap } = props;

    this.state = {
      secretAccessKey: configsMap.secretAccessKey || '',
      accessKeyId: configsMap.accessKeyId || '',
      region: configsMap.region || '',
      configSet: configsMap.configSet || '',
      emailVerificationType: configsMap.emailVerificationType || '',
      trueMailApiKey: configsMap.trueMailApiKey || '',
      telnyxApiKey: configsMap.telnyxApiKey || '',
      telnyxPhone: configsMap.telnyxPhone || '',
      telnyxProfileId: configsMap.telnyxProfileId || '',
      defaultEmailService: configsMap.defaultEmailService || 'SES',
      selectedTab: 'general'
    };
  }

  generateDoc = values => {
    const { defaultEmailService } = this.state;
    return { configsMap: { ...values, defaultEmailService } };
  };

  onChangeCommon = (name: CommonFields, e) => {
    this.setState({ [name]: e.currentTarget.value });
  };

  onVerifyEmail = () => {
    const { emailToVerify } = this.state;

    if (emailToVerify) {
      return this.props.verifyEmail(emailToVerify);
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
                <Icon icon="times" />
              </span>
            </Recipient>
          ))}
        </Recipients>
      </>
    );
  };

  renderItem = (
    key: string,
    label: string,
    formProps: IFormProps,
    description?: string,
    componentClass?: string
  ) => {
    const { configsMap } = this.props;

    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          {...formProps}
          name={key}
          max={140}
          componentClass={componentClass}
          defaultValue={configsMap[key]}
          onChange={this.onChangeCommon.bind(this, key)}
        />
      </FormGroup>
    );
  };

  renderSeSConfig = formProps => {
    return (
      <>
        <Info>
          <p>
            {__(
              'Amazon Simple Email Service enables you to send and receive email using a reliable and scalable email platform. Set up your custom amazon simple email service account'
            ) + '.'}
          </p>
          <a
            target="_blank"
            href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#aws-ses"
            rel="noopener noreferrer"
          >
            {__('Learn more about Amazon SES configuration')}
          </a>
        </Info>
        {this.renderItem('accessKeyId', 'AWS SES Access key ID', formProps)}
        {this.renderItem(
          'secretAccessKey',
          'AWS SES Secret access key',
          formProps
        )}
        {this.renderItem('region', 'AWS SES Region', formProps)}
        {this.renderItem('configSet', 'AWS SES Config set', formProps)}
      </>
    );
  };

  renderCustomMailConfig = formProps => {
    return (
      <>
        <Info>
          <a
            target="_blank"
            href="https://docs.erxes.io/docs/user-guide/xos/system-configuration#custom-mail-service"
            rel="noopener noreferrer"
          >
            {__('Learn the case of custom email service')}
          </a>
        </Info>
        {this.renderItem('mailServiceName', 'Mail Service Name', formProps)}
        {this.renderItem('customMailPort', 'Port', formProps)}
        {this.renderItem('customMailUsername', 'Username', formProps)}
        {this.renderItem('customMailPassword', 'Password', formProps)}
        {this.renderItem('customMailHost', 'Host', formProps)}
      </>
    );
  };

  renderGeneral = (formProps: IFormProps) => {
    const { configsMap } = this.props;
    const { defaultEmailService } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel>Unverified emails limit</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="unverifiedEmailsLimit"
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
            name="allowedEmailSkipLimit"
            defaultValue={configsMap.allowedEmailSkipLimit || 10}
          />
        </FormGroup>

        <FormGroup>
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
        </FormGroup>

        <FormGroup>
          <ControlLabel>DEFAULT EMAIL SERVICE</ControlLabel>
          <p>
            {__(
              'Choose your email service name. The default email service is SES.'
            )}
          </p>
          <Select
            options={[
              { label: 'SES', value: 'SES' },
              { label: 'Custom', value: 'custom' }
            ]}
            value={defaultEmailService}
            clearable={false}
            searchable={false}
            onChange={({ value }) =>
              this.setState({ defaultEmailService: value })
            }
          />
        </FormGroup>
      </>
    );
  };

  renderContent = () => {
    const { renderButton } = this.props;

    const content = (formProps: IFormProps) => {
      const { values, isSubmitted } = formProps;
      return (
        <Container>
          <CollapseContent
            title="General settings"
            transparent
            beforeTitle={<Icon icon="settings" />}
          >
            {this.renderGeneral(formProps)}
          </CollapseContent>

          <CollapseContent
            title="AWS SES"
            transparent
            beforeTitle={<Icon icon="shield-check" />}
          >
            {this.renderSeSConfig(formProps)}
          </CollapseContent>

          <CollapseContent
            title="Custom mail service"
            transparent
            beforeTitle={<Icon icon="server-alt" />}
          >
            {this.renderCustomMailConfig(formProps)}
          </CollapseContent>
          <ModalFooter>
            {renderButton({
              name: 'configsMap',
              values: this.generateDoc(values),
              isSubmitted,
              object: this.props.configsMap
            })}
          </ModalFooter>
        </Container>
      );
    };

    return <Form renderContent={content} />;
  };

  renderVerify = () => {
    return (
      <Container>
        <CollapseContent
          transparent
          beforeTitle={<Icon icon="envelope-shield" />}
          title={__('Verify the email addresses that you send email from')}
        >
          {this.renderVerifiedEmails()}

          <Verify>
            <Icon icon="shield-check" size={36} />
            <ControlLabel required={true}>Email</ControlLabel>
            <FormControl
              type="email"
              onChange={this.onChangeCommon.bind(this, 'emailToVerify')}
            />

            <Button
              onClick={this.onVerifyEmail}
              btnStyle="success"
              icon="check-circle"
            >
              Verify
            </Button>
          </Verify>
        </CollapseContent>
        <CollapseContent
          transparent
          beforeTitle={<Icon icon="mail-alt" />}
          title={__('Send your test email')}
        >
          <FormGroup>
            <ControlLabel>From</ControlLabel>
            <FormControl
              placeholder="from@email.com"
              onChange={this.onChangeCommon.bind(this, 'testFrom')}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>To</ControlLabel>
            <FormControl
              placeholder="to@email.com"
              onChange={this.onChangeCommon.bind(this, 'testTo')}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Content</ControlLabel>
            <FormControl
              placeholder={__('Write your content') + '...'}
              componentClass="textarea"
              onChange={this.onChangeCommon.bind(this, 'testContent')}
            />
          </FormGroup>

          <ModalFooter>
            <Button
              btnStyle="success"
              icon="message"
              onClick={this.onSendTestEmail}
            >
              Send test email
            </Button>
          </ModalFooter>
        </CollapseContent>
      </Container>
    );
  };

  render() {
    const { selectedTab } = this.state;

    return (
      <ContentBox id={'EngageSettingsMenu'}>
        <Tabs full>
          <TabTitle
            className={selectedTab === 'general' ? 'active' : ''}
            onClick={() => this.setState({ selectedTab: 'general' })}
          >
            {__('General Settings')}
          </TabTitle>
          <TabTitle
            className={selectedTab === 'verify' ? 'active' : ''}
            onClick={() => this.setState({ selectedTab: 'verify' })}
          >
            {__('Verify')}
          </TabTitle>
        </Tabs>
        {selectedTab === 'verify' ? this.renderVerify() : this.renderContent()}
      </ContentBox>
    );
  }
}

export default EngageSettingsContent;
