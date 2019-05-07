import { IUser } from 'modules/auth/types';
import { FormControl, Step, Steps } from 'modules/common/components';
import {
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { ISegment, ISegmentDoc } from 'modules/segments/types';
import { IBrand } from 'modules/settings/brands/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import * as React from 'react';
import { IActivityLogForMonth } from '../../activityLogs/types';
import { IBreadCrumbItem } from '../../common/types';
import {
  IEngageEmail,
  IEngageMessage,
  IEngageMessageDoc,
  IEngageMessenger,
  IEngageScheduleDate
} from '../types';
import { ChannelStep, MessageStep, SegmentStep } from './step';

type Props = {
  message?: IEngageMessage;
  brands: IBrand[];
  users: IUser[];
  segments: ISegment[];
  headSegments: ISegment[];
  segmentFields: ISegment[];
  templates: IEmailTemplate[];
  segmentAdd: (params: { doc: ISegmentDoc }) => void;
  customerCounts?: IActivityLogForMonth[];
  count: (segment: ISegmentDoc) => void;
  kind: string;
  save: (doc: IEngageMessageDoc) => Promise<any>;
  validateDoc: (
    type: string,
    doc: IEngageMessageDoc
  ) => { status: string; doc?: IEngageMessageDoc };
  renderTitle: () => string;
  breadcrumbs: IBreadCrumbItem[];
};

type State = {
  activeStep: number;
  maxStep: number;
  method: string;
  title: string;
  segmentId: string;
  content: string;
  fromUserId: string;
  messenger?: IEngageMessenger;
  email?: IEngageEmail;
  scheduleDate: IEngageScheduleDate;
};

class AutoAndManualForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const message = props.message || {};
    const messenger = message.messenger || {};
    const email = message.email || {};

    const content = messenger.content ? messenger.content : email.content || '';

    this.state = {
      activeStep: 1,
      maxStep: 3,
      method: message.method || 'email',
      title: message.title || '',
      segmentId: message.segmentId || '',
      content,
      fromUserId: message.fromUserId,
      messenger: message.messenger,
      email: message.email,
      scheduleDate: message.scheduleDate
    };
  }

  changeState = <T extends keyof State>(key: T, value: State[T]) => {
    this.setState({ [key]: value } as Pick<State, keyof State>);
  };

  save = (type: string): Promise<any> | void => {
    const doc = {
      segmentId: this.state.segmentId,
      title: this.state.title,
      fromUserId: this.state.fromUserId,
      method: this.state.method
    } as IEngageMessageDoc;

    if (this.props.kind !== 'manual') {
      doc.scheduleDate = this.state.scheduleDate;
    }

    if (this.state.method === 'email') {
      const email = this.state.email || ({} as IEngageEmail);

      doc.email = {
        templateId: email.templateId,
        subject: email.subject || '',
        content: this.state.content,
        attachments: email.attachments
      };
    } else if (this.state.method === 'messenger') {
      const messenger = this.state.messenger || ({} as IEngageMessenger);

      doc.messenger = {
        brandId: messenger.brandId || '',
        kind: messenger.kind || '',
        sentAs: messenger.sentAs || '',
        content: this.state.content
      };
    }

    const response = this.props.validateDoc(type, doc);

    if (response.status === 'ok' && response.doc) {
      return this.props.save(response.doc);
    }
  };

  render() {
    const { renderTitle, breadcrumbs } = this.props;

    const {
      activeStep,
      maxStep,
      messenger,
      email,
      fromUserId,
      content,
      scheduleDate
    } = this.state;

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
            defaultValue={this.state.title}
          />
        </TitleContainer>

        <Steps maxStep={maxStep} active={activeStep}>
          <Step img="/images/icons/erxes-05.svg" title="Choose channel">
            <ChannelStep
              onChange={this.changeState}
              method={this.state.method}
            />
          </Step>

          <Step
            img="/images/icons/erxes-02.svg"
            title="Who is this message for?"
          >
            <SegmentStep
              onChange={this.changeState}
              segments={this.props.segments}
              headSegments={this.props.headSegments}
              segmentFields={this.props.segmentFields}
              segmentAdd={this.props.segmentAdd}
              counts={this.props.customerCounts}
              count={this.props.count}
              segmentId={this.state.segmentId}
            />
          </Step>

          <Step
            img="/images/icons/erxes-08.svg"
            title="Compose your message"
            save={this.save.bind(
              this,
              this.props.kind === 'manual' ? 'live' : 'draft'
            )}
            message={this.props.message}
          >
            <MessageStep
              brands={this.props.brands}
              onChange={this.changeState}
              users={this.props.users}
              method={this.state.method}
              templates={this.props.templates}
              kind={this.props.kind}
              messenger={messenger}
              email={email}
              fromUserId={fromUserId}
              content={content}
              scheduleDate={scheduleDate}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

export default AutoAndManualForm;
