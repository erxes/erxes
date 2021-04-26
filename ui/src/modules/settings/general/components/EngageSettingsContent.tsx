import Button from 'modules/common/components/Button';
import CollapseContent from 'modules/common/components/CollapseContent';
import { FormControl } from 'modules/common/components/form';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Info from 'modules/common/components/Info';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { Recipient, Recipients } from 'modules/engage/styles';
import { ContentBox } from 'modules/settings/styles';
import React from 'react';
import { IConfigsMap } from '../types';
import { Verify } from './styles';

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
};

type CommonFields =
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
      secretAccessKey: configsMap.secretAccessKey || '',
      accessKeyId: configsMap.accessKeyId || '',
      region: configsMap.region || '',
      configSet: configsMap.configSet || '',
      emailVerificationType: configsMap.emailVerificationType || '',
      trueMailApiKey: configsMap.trueMailApiKey || '',
      telnyxApiKey: configsMap.telnyxApiKey || '',
      telnyxPhone: configsMap.telnyxPhone || '',
      telnyxProfileId: configsMap.telnyxProfileId || ''
    };
  }

  generateDoc = values => {
    return { configsMap: values };
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

  renderContent = (formProps: IFormProps) => {
    const { configsMap, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

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
            href="https://erxes.org/administrator/system-config#aws-ses"
            rel="noopener noreferrer"
          >
            {__('Learn more about Amazon SES configuration')}
          </a>
        </Info>
        <FormGroup>
          <ControlLabel>AWS SES Access key ID</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="accessKeyId"
            defaultValue={configsMap.accessKeyId}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS SES Secret access key</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="secretAccessKey"
            defaultValue={configsMap.secretAccessKey}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS SES Region</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="region"
            defaultValue={configsMap.region}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS SES Config set</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="configSet"
            defaultValue={configsMap.configSet}
          />
        </FormGroup>

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
            <strong> do not disturb </strong>mode.
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

        <ModalFooter>
          {renderButton({
            name: 'configsMap',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.configsMap
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return (
      <ContentBox id={'EngageSettingsMenu'}>
        <CollapseContent title="General settings">
          <Form renderContent={this.renderContent} />
        </CollapseContent>

        <CollapseContent
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
              btnStyle="primary"
              icon="check-circle"
              uppercase={false}
            >
              Verify
            </Button>
          </Verify>
        </CollapseContent>
        <CollapseContent title={__('Send your first testing email')}>
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
              btnStyle="primary"
              icon="message"
              onClick={this.onSendTestEmail}
              uppercase={false}
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
