import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { FormControl, Step, Steps } from 'modules/common/components';
import {
  StepWrapper,
  TitleContainer
} from 'modules/common/components/step/styles';
import { ChannelStep, SegmentStep, MessageStep } from './step';
import FormBase from './FormBase';

const propTypes = {
  segments: PropTypes.array.isRequired,
  headSegments: PropTypes.array.isRequired,
  segmentFields: PropTypes.array.isRequired,
  segmentAdd: PropTypes.func.isRequired,
  templates: PropTypes.array.isRequired,
  customerCounts: PropTypes.object.isRequired,
  count: PropTypes.func.isRequired,
  message: PropTypes.object
};

class AutoAndManualForm extends FormBase {
  constructor(props) {
    super(props);

    const message = props.message || {};
    let content = message.messenger ? message.messenger.content : '';
    content = message.email ? message.email.content : content;
    const messenger = message.messenger || {};
    const email = message.email || {};

    this.state = {
      activeStep: 1,
      maxStep: 3,
      method: message.method || 'email',
      title: message.title || null,
      segment: message.segmentId || '',
      message: content,
      fromUser: message.fromUserId,
      messenger: {
        brandId: messenger.brandId || '',
        kind: messenger.kind || '',
        sentAs: messenger.sentAs || ''
      },
      email: {
        templateId: email.templateId || '',
        subject: email.subject || '',
        attachments: email.attachments || []
      }
    };
  }

  generateDoc(e) {
    e.preventDefault();

    const doc = {
      segmentId: this.state.segment,
      title: this.state.title,
      fromUserId: this.state.fromUser,
      method: this.state.method
    };

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

    return doc;
  }

  render() {
    const {
      activeStep,
      maxStep,
      messenger,
      email,
      fromUser,
      message
    } = this.state;

    const defaultMessageStepValue = { messenger, email, fromUser, message };
    const { __ } = this.context;

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={this.renderTitle()} />

        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl
            required
            onChange={e => this.changeState('title', e.target.value)}
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
              changeMethod={this.changeState}
              method={this.state.method}
            />
          </Step>

          <Step
            img="/images/icons/erxes-02.svg"
            title="Who is this message for?"
            next={this.next}
          >
            <SegmentStep
              changeSegment={this.changeState}
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
              changeState={this.changeState}
              users={this.props.users}
              method={this.state.method}
              templates={this.props.templates}
              defaultValue={defaultMessageStepValue}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

AutoAndManualForm.propTypes = propTypes;
AutoAndManualForm.contextTypes = {
  __: PropTypes.func
};

export default AutoAndManualForm;
