import { IUser } from 'modules/auth/types';
import { FormControl, Step, Steps } from 'modules/common/components';
import {
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import { Wrapper } from 'modules/layout/components';
import { ISegment } from 'modules/segments/types';
import { IBrand } from 'modules/settings/brands/types';
import { IEmailTemplate } from 'modules/settings/emailTemplates/types';
import * as React from 'react';
import { IEngageMessage } from '../types';
import { ChannelStep, MessageStep, SegmentStep } from './step';

type Props = {
  message?: IEngageMessage,
  brands?: IBrand[],
  users?: IUser[],
  segments?: ISegment[],
  headSegments?: ISegment[],
  segmentFields?: ISegment[],
  segmentAdd?: ({ doc }: { doc: any; }) => void,
  templates?: IEmailTemplate[],
  customerCounts?: any,
  count?: (segment: ISegment) => void,
  kind?: string,
  validateAndSaveForm?: (type: string, doc: any) => void,
  renderTitle?: () => void,
  changeState?: (name: string, value: string) => void,
};

type State = {
  activeStep: number,
  maxStep: number,
  method: string,
  title: string,
  segment: string,
  message: string,
  fromUser: string,
  messenger: any,
  email: any,
  scheduleDate: Date
}

class AutoAndManualForm extends React.Component<Props, State> {
  private next;

  constructor(props) {
    super(props);

    const message = props.message || {};

    let content = message.messenger ? message.messenger.content : '';
    content = message.email ? message.email.content : content;

    this.state = {
      activeStep: 1,
      maxStep: 3,
      method: message.method || 'email',
      title: message.title || null,
      segment: message.segmentId || '',
      message: content,
      fromUser: message.fromUserId,
      messenger: message.messenger,
      email: message.email,
      scheduleDate: message.scheduleDate
    };
  }

  save(type, e) {
    e.preventDefault();

    const doc = {
      segmentId: this.state.segment,
      title: this.state.title,
      fromUserId: this.state.fromUser,
      method: this.state.method,
      scheduleDate: {},
      email: {}, messenger: {}
    };

    if (this.props.kind !== 'manual') {
      doc.scheduleDate = this.state.scheduleDate;
    }

    if (this.state.method === 'email') {
      doc.email = {
        templateId: this.state.email.templateId,
        subject: this.state.email.subject,
        content: this.state.message,
        attachments: this.state.email.attachments
      };
    } else if (this.state.method === 'messenger') {
      doc.messenger = {
        brandId: this.state.messenger.brandId,
        kind: this.state.messenger.kind,
        sentAs: this.state.messenger.sentAs,
        content: this.state.message
      };
    }

    return this.props.validateAndSaveForm(type, doc);
  }

  render() {
    const { renderTitle, changeState } = this.props;

    const {
      activeStep,
      maxStep,
      messenger,
      email,
      fromUser,
      message,
      scheduleDate
    } = this.state;

    const defaultMessageStepValue = {
      messenger,
      email,
      fromUser,
      message,
      scheduleDate
    };

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={renderTitle()} />

        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl
            required
            onChange={e => changeState('title', (e.target as HTMLInputElement).value)}
            defaultValue={this.state.title}
          />
        </TitleContainer>

        <Steps maxStep={maxStep} active={activeStep}>
          <Step
            img="/images/icons/erxes-05.svg"
            title="Choose channel"
            next={this.next}
          >
            <ChannelStep
              changeMethod={changeState}
              method={this.state.method}
            />
          </Step>

          <Step
            img="/images/icons/erxes-02.svg"
            title="Who is this message for?"
            next={this.next}
          >
            <SegmentStep
              changeSegment={changeState}
              segments={this.props.segments}
              headSegments={this.props.headSegments}
              segmentFields={this.props.segmentFields}
              segmentAdd={this.props.segmentAdd}
              counts={this.props.customerCounts}
              count={this.props.count}
              segment={this.state.segment}
            />
          </Step>

          <Step
            img="/images/icons/erxes-08.svg"
            title="Compose your message"
            save={this.save}
            next={this.next}
            message={this.props.message}
          >
            <MessageStep
              brands={this.props.brands}
              changeState={changeState}
              users={this.props.users}
              method={this.state.method}
              templates={this.props.templates}
              defaultValue={defaultMessageStepValue}
              kind={this.props.kind}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

export default AutoAndManualForm;
