import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import ConditionsRule from '@erxes/ui/src/components/rule/ConditionsRule';
import Step from '@erxes/ui/src/components/step/Step';
import Steps from '@erxes/ui/src/components/step/Steps';
import {
  StepWrapper,
  TitleContainer,
} from '@erxes/ui/src/components/step/styles';
import { Alert, __ } from 'coreui/utils';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { IBrand } from '@erxes/ui/src/brands/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { IBreadCrumbItem, IConditionsRule } from '@erxes/ui/src/types';
import { IConfig } from '@erxes/ui-settings/src/general/types';

import React from 'react';
import { Link } from 'react-router-dom';
import { MESSAGE_KINDS, METHODS } from '@erxes/ui-engage/src/constants';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import {
  IEngageEmail,
  IEngageMessage,
  IEngageMessageDoc,
  IEngageMessenger,
  IEngageSms,
  IEngageNotification,
  IEmailTemplate,
  IIntegrationWithPhone,
} from '@erxes/ui-engage/src/types';
import { ClientPortalConfig } from '@erxes/plugin-clientportal-ui/src/types';
import SmsForm from './SmsForm';
import NotificationForm from './NotificationForm';
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
  currentUser: IUser;
  clientPortalGetConfigs: ClientPortalConfig[];
  businessPortalKind?: string;
  handleClientPortalKindChange: (kind: string) => void;
  segmentsTypes?: any[];
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
  shortMessage?: IEngageSms;
  rules: IConditionsRule[];
  isSaved: boolean;
  notification?: IEngageNotification;
  cpId?: string;
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
      method: message.method || METHODS.EMAIL || METHODS.NOTIFICATION,
      title: message.title || '',
      segmentIds: message.segmentIds || [],
      brandIds: message.brandIds || [],
      tagIds: message.customerTagIds || [],
      content,
      fromUserId: message.fromUserId,
      messenger: message.messenger,
      email: message.email,
      shortMessage: message.shortMessage,
      notification: message.notification,
      cpId: message.cpId,
      rules,
      isSaved: false,
    };
  }

  changeState = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState({ [key]: value } as unknown as Pick<State, keyof State>);
  };

  clearState = () => {
    this.setState({
      segmentIds: [],
      brandIds: [],
      tagIds: [],
      rules: [],
    });
  };

  handleSubmit = (type: string): Promise<any> | void => {
    const currentUser = this.props.currentUser;
    const doc = {
      segmentIds: this.state.segmentIds,
      customerTagIds: this.state.tagIds,
      brandIds: this.state.brandIds,
      title: this.state.title,
      fromUserId: this.state.fromUserId,
      method: this.state.method,
      shortMessage: this.state.shortMessage,
      notification: this.state.notification,
      cpId: this.state.cpId,
    } as IEngageMessageDoc;

    if (this.state.method === METHODS.EMAIL) {
      const email = this.state.email || ({} as IEngageEmail);
      doc.kind = MESSAGE_KINDS.MANUAL;

      doc.email = {
        subject: email.subject || '',
        sender: email.sender || '',
        replyTo: (email.replyTo || '').split(' ').toString(),
        content: this.state.content,
        attachments: email.attachments,
        templateId: email.templateId || '',
      };

      if (doc.messenger) {
        delete doc.messenger;
      }
      if (doc.shortMessage) {
        delete doc.shortMessage;
      }
      if (doc.notification) {
        delete doc.notification;
      }
    }
    if (this.state.method === METHODS.MESSENGER) {
      const messenger = this.state.messenger || ({} as IEngageMessenger);
      doc.kind = MESSAGE_KINDS.VISITOR_AUTO;

      doc.messenger = {
        brandId: messenger.brandId || '',
        kind: messenger.kind || '',
        sentAs: messenger.sentAs || '',
        content: this.state.content,
        rules: this.state.rules,
      };

      if (doc.email) {
        delete doc.email;
      }
      if (doc.shortMessage) {
        delete doc.shortMessage;
      }
      if (doc.notification) {
        delete doc.notification;
      }
    }
    if (this.state.method === METHODS.SMS) {
      const shortMessage = this.state.shortMessage || {
        from: '',
        content: '',
        fromIntegrationId: '',
      };

      doc.shortMessage = {
        from: shortMessage.from,
        content: shortMessage.content,
        fromIntegrationId: shortMessage.fromIntegrationId,
      };

      if (doc.email) {
        delete doc.email;
      }
      if (doc.messenger) {
        delete doc.messenger;
      }
      if (doc.notification) {
        delete doc.notification;
      }
    }

    if (this.state.method === METHODS.NOTIFICATION) {
      doc.kind = MESSAGE_KINDS.MANUAL;
      const notification = this.state?.notification || {
        title: '',
        content: '',
        isMobile: false,
      };

      doc.notification = {
        title: notification.title,
        content: notification.content,
        isMobile: notification.isMobile || false,
      };
      doc.fromUserId = currentUser?._id;
      if (doc.email) {
        delete doc.email;
      }
      if (doc.messenger) {
        delete doc.messenger;
      }
      if (doc.shortMessage) {
        delete doc.shortMessage;
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
        to='/campaigns'
        onClick={() => {
          this.setState({ isSaved: true });
        }}
      >
        <Button btnStyle='simple' icon='times-circle'>
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
            btnStyle='warning'
            icon={isActionLoading ? undefined : 'file-alt'}
            onClick={this.handleSubmit.bind(this, 'draft')}
          >
            Save & Draft
          </Button>
          <Button
            disabled={isActionLoading}
            btnStyle='success'
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
    const { message, brands, users, kind, templates, smsConfig, integrations } =
      this.props;

    const {
      messenger,
      email,
      fromUserId,
      content,
      method,
      shortMessage,
      notification,
      isSaved,
    } = this.state;

    const imagePath = '/images/icons/erxes-08.svg';

    if (method === METHODS.SMS) {
      return (
        <Step noButton={true} title='Compose your SMS' img={imagePath}>
          <SmsForm
            onChange={this.changeState}
            messageKind={kind}
            shortMessage={shortMessage}
            fromUserId={fromUserId}
            smsConfig={smsConfig}
            integrations={integrations}
          />
        </Step>
      );
    }

    if (method === METHODS.NOTIFICATION) {
      return (
        <Step noButton={true} title='Compose your notification' img={imagePath}>
          <NotificationForm
            onChange={this.changeState}
            messageKind={kind}
            notification={notification}
          />
        </Step>
      );
    }

    return (
      <Step
        img={imagePath}
        title='Compose your broadcast'
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
      <Step img='/images/icons/erxes-04.svg' title='Rule'>
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
        img='/images/icons/erxes-19.svg'
        title='Full Preview'
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
    const { clientPortalGetConfigs, renderTitle, breadcrumbs, segmentType } =
      this.props;
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
          <Step img='/images/icons/erxes-05.svg' title='Choose channel'>
            <ChannelStep
              onChange={this.changeState}
              method={this.state.method}
              kind={this.props.kind}
            />
          </Step>

          <Step
            img='/images/icons/erxes-06.svg'
            title='Who is this broadcast for?'
          >
            <MessageTypeStep
              method={this.state.method}
              onChange={this.changeState}
              clearState={this.clearState}
              segmentType={segmentType}
              segmentIds={segmentIds}
              brandIds={brandIds}
              tagIds={tagIds}
              clientPortalGetConfigs={clientPortalGetConfigs}
              businessPortalKind={this.props.businessPortalKind}
              handleClientPortalKindChange={
                this.props.handleClientPortalKindChange
              }
              selectedCpId={this.state.cpId}
              segmentsTypes={this.props.segmentsTypes}
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

export default withCurrentUser(AutoAndManualForm);
