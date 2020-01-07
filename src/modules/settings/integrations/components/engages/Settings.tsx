import Button from 'modules/common/components/Button';
import { FormControl } from 'modules/common/components/form';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Info from 'modules/common/components/Info';
import { Tabs, TabTitle } from 'modules/common/components/tabs';
import { ModalFooter, TabContent } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import { Recipient, Recipients } from 'modules/engage/styles';
import { IEngageConfig } from 'modules/engage/types';
import React from 'react';
import { Verify } from '../../styles';
import Description from './Description';

type Props = {
  engagesConfigDetail: IEngageConfig;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  verifyEmail: (email: string) => void;
  removeVerifiedEmail: (email: string) => void;
  sendTestEmail: (from: string, to: string, content: string) => void;
  closeModal: () => void;
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
  currentTab?: string;
};

class List extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { engagesConfigDetail } = props;

    this.state = {
      secretAccessKey: engagesConfigDetail.secretAccessKey || '',
      accessKeyId: engagesConfigDetail.accessKeyId || '',
      region: engagesConfigDetail.region || '',
      currentTab: 'config'
    };
  }

  generateDoc = values => {
    return values;
  };

  onChangeCommon = (
    name: 'emailToVerify' | 'testFrom' | 'testTo' | 'testContent',
    e
  ) => {
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

  onTabClick = currentTab => {
    this.setState({ currentTab });
  };

  renderTabContent = () => {
    if (this.state.currentTab === 'config') {
      return <Form renderContent={this.renderContent} />;
    }

    return this.renderTestContent();
  };

  renderVerifiedEmails = () => {
    const { verifiedEmails } = this.props;

    if (verifiedEmails.length === 0) {
      return;
    }

    return (
      <>
        <h4>Verified emails:</h4>

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

  renderTestContent = () => {
    return (
      <>
        <Info bordered={false}>
          {this.renderVerifiedEmails()}

          <Verify>
            <Icon icon="shield-check" size={36} />
            <ControlLabel required={true}>Email:</ControlLabel>
            <FormControl
              type="email"
              onChange={this.onChangeCommon.bind(this, 'emailToVerify')}
            />

            <Button
              size="small"
              onClick={this.onVerifyEmail}
              btnStyle="success"
              icon="check-1"
            >
              Verify
            </Button>
          </Verify>
        </Info>

        <Info bordered={false}>
          <h4>Send test email:</h4>

          <FormGroup>
            <ControlLabel>From:</ControlLabel>
            <FormControl
              placeholder="from@email.com"
              onChange={this.onChangeCommon.bind(this, 'testFrom')}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>To:</ControlLabel>
            <FormControl
              placeholder="to@email.com"
              onChange={this.onChangeCommon.bind(this, 'testTo')}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Content:</ControlLabel>
            <FormControl
              placeholder="Write your content..."
              componentClass="textarea"
              onChange={this.onChangeCommon.bind(this, 'testContent')}
            />
          </FormGroup>

          <Button
            size="small"
            btnStyle="primary"
            icon="message"
            onClick={this.onSendTestEmail}
          >
            Send test email
          </Button>
        </Info>
      </>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { engagesConfigDetail, renderButton, closeModal } = this.props;

    const { values, isSubmitted } = formProps;

    return (
      <>
        <Description />
        <FormGroup>
          <ControlLabel>AWS-SES Access key ID</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="accessKeyId"
            defaultValue={engagesConfigDetail.accessKeyId}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS-SES Secret access key</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="secretAccessKey"
            defaultValue={engagesConfigDetail.secretAccessKey}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>AWS-SES Region</ControlLabel>
          <FormControl
            {...formProps}
            max={140}
            name="region"
            defaultValue={engagesConfigDetail.region}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          {renderButton({
            name: 'engagesConfigDetail',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.engagesConfigDetail
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    const { currentTab } = this.state;

    return (
      <>
        <Tabs full={true}>
          <TabTitle
            className={currentTab === 'config' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'config')}
          >
            {__('Configure')}
          </TabTitle>
          <TabTitle
            className={currentTab === 'test' ? 'active' : ''}
            onClick={this.onTabClick.bind(this, 'test')}
          >
            {__('Test configuration')}
          </TabTitle>
        </Tabs>
        <TabContent>{this.renderTabContent()}</TabContent>
      </>
    );
  }
}

export default List;
