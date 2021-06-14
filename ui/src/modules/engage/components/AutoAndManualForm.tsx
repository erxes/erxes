import { IUser } from 'modules/auth/types';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import ConditionsRule from 'modules/common/components/rule/ConditionsRule';
import { Step, Steps } from 'modules/common/components/step';
import {
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { Alert } from 'modules/common/utils';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import { IBrand } from 'modules/settings/brands/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import { IConfig } from 'modules/settings/general/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { IBreadCrumbItem, IConditionsRule } from '../../common/types';
import { METHODS } from '../constants';
import {
  IEngageEmail,
  IEngageMessage,
  IEngageMessageDoc,
  IEngageMessenger,
  IEngageScheduleDate,
  IEngageSms,
  IIntegrationWithPhone
} from '../types';
import SmsForm from './SmsForm';
import ChannelStep from './step/ChannelStep';
import FullPreviewStep from './step/FullPreviewStep';
import MessageStep from './step/MessageStep';
import MessageTypeStep from './step/MessageTypeStep';

type Props = {
  message?: IEngageMessage;
  brands: IBrand[];
  users: IUser[];
  templates: IEmailTemplate[];
  kind: string;
  segmentType?: string;
  isActionLoading: boolean;
  handleSubmit?: (name: string, e: React.MouseEvent) => void;
  save: (doc: IEngageMessageDoc) => Promise<any>;
  validateDoc: (
    type: string,
    doc: IEngageMessageDoc
  ) => { status: string; doc?: IEngageMessageDoc };
  renderTitle: () => string;
  breadcrumbs: IBreadCrumbItem[];
  smsConfig: IConfig;
  integrations: IIntegrationWithPhone[];
};

type State = {
  method: string;
  title: string;
  segmentIds: string[];
  brandIds: string[];
  tagIds: string[];
  content: string;
  fromUserId: string;
  messenger?: IEngageMessenger;
  email?: IEngageEmail;
  scheduleDate: IEngageScheduleDate;
  shortMessage?: IEngageSms;
  rules: IConditionsRule[];
  isSaved: boolean;
};

class AutoAndManualForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const message = props.message || {};
    const messenger = message.messenger || ({} as IEngageMessenger);
    const email = message.email || {};

    let content = email.content || '';

    const rules = messenger.rules
      ? messenger.rules.map(rule => ({ ...rule }))
      : [];

    if (messenger.content && messenger.content !== '') {
      content = messenger.content;
    }

    this.state = {
      method: message.method || METHODS.EMAIL,
      title: message.title || '',
      segmentIds: message.segmentIds || [],
      brandIds: message.brandIds || [],
      tagIds: message.customerTagIds || [],
      content,
      fromUserId: message.fromUserId,
      messenger: message.messenger,
      email: message.email,
      scheduleDate: message.scheduleDate,
      shortMessage: message.shortMessage,
      rules,
      isSaved: false
    };
  }

  changeState = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState(({ [key]: value } as unknown) as Pick<State, keyof State>);
  };

  clearState = () => {
    this.setState({
      segmentIds: [],
      brandIds: [],
      tagIds: [],
      rules: []
    });
  };

  handleSubmit = (type: string): Promise<any> | void => {
    const doc = {
      segmentIds: this.state.segmentIds,
      customerTagIds: this.state.tagIds,
      brandIds: this.state.brandIds,
      title: this.state.title,
      fromUserId: this.state.fromUserId,
      method: this.state.method,
      scheduleDate: this.state.scheduleDate,
      shortMessage: this.state.shortMessage
    } as IEngageMessageDoc;

    if (this.state.method === METHODS.EMAIL) {
      const email = this.state.email || ({} as IEngageEmail);

      doc.email = {
        subject: email.subject || '',
        sender: email.sender || '',
        replyTo: (email.replyTo || '').split(' ').toString(),
        content: this.state.content,
        attachments: email.attachments,
        templateId: email.templateId || ''
      };

      if (doc.messenger) {
        delete doc.messenger;
      }
      if (doc.shortMessage) {
        delete doc.shortMessage;
      }
    }
    if (this.state.method === METHODS.MESSENGER) {
      const messenger = this.state.messenger || ({} as IEngageMessenger);

      doc.messenger = {
        brandId: messenger.brandId || '',
        kind: messenger.kind || '',
        sentAs: messenger.sentAs || '',
        content: this.state.content,
        rules: this.state.rules
      };

      if (doc.email) {
        delete doc.email;
      }
      if (doc.shortMessage) {
        delete doc.shortMessage;
      }
    }
    if (this.state.method === METHODS.SMS) {
      const shortMessage = this.state.shortMessage || {
        from: '',
        content: '',
        fromIntegrationId: ''
      };

      doc.shortMessage = {
        from: shortMessage.from,
        content: shortMessage.content,
        fromIntegrationId: shortMessage.fromIntegrationId
      };

      if (doc.email) {
        delete doc.email;
      }
      if (doc.messenger) {
        delete doc.messenger;
      }
    }

    const response = this.props.validateDoc(type, doc);

    if (this.state.method === METHODS.SMS && !this.props.smsConfig) {
      return Alert.warning(
        'SMS integration is not configured. Go to Settings > System config > Integrations config and set Telnyx SMS API key.'
      );
    }

    if (response.status === 'ok' && response.doc) {
      this.setState({ isSaved: true });

      return this.props.save(response.doc);
    }
  };

  renderSaveButton = () => {
    const { isActionLoading } = this.props;

    const cancelButton = (
      <Link
        to="/campaigns"
        onClick={() => {
          this.setState({ isSaved: true });
        }}
      >
        <Button btnStyle="simple" uppercase={false} icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}
        <>
          <Button
            disabled={isActionLoading}
            btnStyle="warning"
            uppercase={false}
            icon={isActionLoading ? undefined : 'file-alt'}
            onClick={this.handleSubmit.bind(this, 'draft')}
          >
            Save & Draft
          </Button>
          <Button
            disabled={isActionLoading}
            btnStyle="success"
            uppercase={false}
            icon={isActionLoading ? undefined : 'check-circle'}
            onClick={this.handleSubmit.bind(this, 'live')}
          >
            Send & Live
          </Button>
        </>
      </Button.Group>
    );
  };

  renderMessageContent() {
    const {
      message,
      brands,
      users,
      kind,
      templates,
      smsConfig,
      integrations
    } = this.props;

    const {
      messenger,
      email,
      fromUserId,
      content,
      scheduleDate,
      method,
      shortMessage,
      isSaved
    } = this.state;

    const imagePath = '/images/icons/erxes-08.svg';

    if (method === METHODS.SMS) {
      return (
        <Step noButton={true} title="Compose your SMS" img={imagePath}>
          <SmsForm
            onChange={this.changeState}
            messageKind={kind}
            scheduleDate={scheduleDate}
            shortMessage={shortMessage}
            fromUserId={fromUserId}
            smsConfig={smsConfig}
            integrations={integrations}
          />
        </Step>
      );
    }

    return (
      <Step
        img={imagePath}
        title="Compose your campaign"
        message={message}
        noButton={method !== METHODS.EMAIL && true}
      >
        <MessageStep
          brands={brands}
          onChange={this.changeState}
          users={users}
          method={this.state.method}
          templates={templates}
          kind={kind}
          messenger={messenger}
          email={email}
          fromUserId={fromUserId}
          content={content}
          scheduleDate={scheduleDate}
          isSaved={isSaved}
        />
      </Step>
    );
  }

  renderRule() {
    const { method } = this.state;

    if (method !== METHODS.MESSENGER) {
      return null;
    }

    return (
      <Step img="/images/icons/erxes-04.svg" title="Rule" stepNumber={3}>
        <ConditionsRule
          rules={this.state.rules || []}
          onChange={this.changeState}
        />
      </Step>
    );
  }

  renderPreviewContent() {
    const { content, email, method } = this.state;

    if (method !== METHODS.EMAIL) {
      return null;
    }

    return (
      <Step
        img="/images/icons/erxes-19.svg"
        title="Full Preview"
        noButton={true}
      >
        <FullPreviewStep
          content={content}
          templateId={email && email.templateId}
        />
      </Step>
    );
  }

  render() {
    const { renderTitle, breadcrumbs, segmentType } = this.props;

    const { segmentIds, brandIds, title, tagIds } = this.state;

    const onChange = e =>
      this.changeState('title', (e.target as HTMLInputElement).value);

    return (
      <StepWrapper>
        <Wrapper.Header title={renderTitle()} breadcrumb={breadcrumbs} />
        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl
            required={true}
            onChange={onChange}
            defaultValue={title}
            autoFocus={true}
          />
          {this.renderSaveButton()}
        </TitleContainer>
        <Steps maxStep={4} active={1}>
          <Step img="/images/icons/erxes-05.svg" title="Choose channel">
            <ChannelStep
              onChange={this.changeState}
              method={this.state.method}
            />
          </Step>

          <Step
            img="/images/icons/erxes-06.svg"
            title="Who is this campaign for?"
          >
            <MessageTypeStep
              onChange={this.changeState}
              clearState={this.clearState}
              segmentType={segmentType}
              segmentIds={segmentIds}
              brandIds={brandIds}
              tagIds={tagIds}
            />
          </Step>

          {this.renderRule()}
          {this.renderMessageContent()}
          {this.renderPreviewContent()}
        </Steps>
      </StepWrapper>
    );
  }
}

export default AutoAndManualForm;
