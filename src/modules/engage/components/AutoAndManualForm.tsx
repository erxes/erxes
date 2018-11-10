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
import { ITag } from 'modules/tags/types';
import * as React from 'react';
import { IActivityLogForMonth } from '../../activityLogs/types';
import { IBreadCrumbItem } from '../../common/types';
import { SegmentStep, TagStep } from '../containers';
import {
  IEngageEmail,
  IEngageMessage,
  IEngageMessageDoc,
  IEngageMessenger,
  IEngageScheduleDate
} from '../types';
import { ChannelStep, ChooseStep, MessageStep } from './step';

type Props = {
  message?: IEngageMessage;
  brands: IBrand[];
  users: IUser[];
  templates: IEmailTemplate[];
  customerCounts?: IActivityLogForMonth[];
  segmentCount: (segment: ISegmentDoc) => void;
  tagCount: (tag: ITag) => void;
  kind: string;
  save: (doc: IEngageMessageDoc) => Promise<any>;
  validateDoc: (
    type: string,
    doc: IEngageMessageDoc
  ) => { status: string; doc?: IEngageMessageDoc };
  renderTitle: () => IBreadCrumbItem[];
};

type State = {
  activeStep: number;
  maxStep: number;
  method: string;
  title: string;
  segmentId: string;
  tagId: string;
  operation: string;
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
      tagId: message.tagId || '',
      operation: 'renderSegment',
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

  renderSegmentStep() {
    /**
     * It will render SegmentStep section when operation argument to do so.
     * Please check the following if statements.
     */
    if (
      this.state.operation === 'createSegment' ||
      this.state.operation === 'renderSegment'
    ) {
      return (
        <SegmentStep
          onChange={this.changeState}
          operation={this.state.operation}
          segmentId={this.state.segmentId}
        />
      );
    }
    return null;
  }

  renderTagStep() {
    /**
     * It will render TagStep section when operation is "renderTag" or "createTag"
     */
    if (
      this.state.operation === 'createTag' ||
      this.state.operation === 'renderTag'
    ) {
      return (
        <TagStep
          onChange={this.changeState}
          operation={this.state.operation}
          tagId={this.state.tagId}
        />
      );
    }
    return null;
  }

  render() {
    const { renderTitle } = this.props;

    const {
      activeStep,
      maxStep,
      messenger,
      email,
      fromUserId,
      content,
      scheduleDate
    } = this.state;

    const onChange = e => {
      this.changeState('title', (e.target as HTMLInputElement).value);
    };
    const onSelectOperation = operation => {
      this.changeState('operation', operation);
    };
    const renderSegmentSection =
      this.state.operation === 'renderSegment' ||
      this.state.operation === 'createSegment';

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={renderTitle()} />

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
            <ChooseStep onSelectOperation={onSelectOperation} />
            {this.renderSegmentStep()}
            {this.renderTagStep()}
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
