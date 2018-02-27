import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { StepWrapper, TitleContainer } from './step/style';
import { FormControl } from 'modules/common/components';
import {
  ChannelStep,
  SegmentStep,
  MessageStep,
  Steps,
  Step,
  ConditionStep
} from './step';

const propTypes = {
  segments: PropTypes.array.isRequired,
  headSegments: PropTypes.array.isRequired,
  segmentFields: PropTypes.array.isRequired,
  segmentAdd: PropTypes.func.isRequired,
  templates: PropTypes.array.isRequired,
  customerCounts: PropTypes.object.isRequired,
  count: PropTypes.func.isRequired,
  message: PropTypes.object,
  brands: PropTypes.array,
  users: PropTypes.array,
  save: PropTypes.func,
  kind: PropTypes.string
};

class AutoAndManualForm extends Component {
  constructor(props) {
    super(props);

    const message = props.message || {};
    const rules = message.messenger
      ? message.messenger.rules.map(rule => ({ ...rule }))
      : [];
    let content = message.messenger ? message.messenger.content : '';
    content = message.email ? message.email.content : content;
    const messenger = message.messenger || {};
    const email = message.email || {};
    const validate = message.title ? false : true;

    this.state = {
      activeStep: 1,
      maxStep: 3,
      validate: {
        step1: false,
        step2: validate,
        step3: validate
      },
      kind: message.kind || 'auto',
      method: message.method || 'messenger',
      title: message.title || null,
      segment: message.segmentId || '',
      message: content,
      fromUser: message.fromUserId,
      rules,
      messenger: {
        brandId: messenger.brandId || '',
        kind: messenger.kind || '',
        sentAs: messenger.sentAs || ''
      },
      email: {
        templateId: email.templateId || '',
        subject: email.subject || ''
      }
    };

    this.save = this.save.bind(this);
    this.next = this.next.bind(this);
    this.changeState = this.changeState.bind(this);
  }

  save(type, e) {
    const doc = this.generateDoc(e);
    if (type === 'live') {
      this.props.save({ isLive: true, isDraft: false, ...doc });
    } else if (type === 'draft ') {
      this.props.save({ isLive: false, isDraft: true, ...doc });
    } else {
      this.props.save(doc);
    }
  }

  validate() {
    const step3 = this.state[this.state.method];
    let validate = { ...this.state.validate };
    validate['step2'] = false;
    validate['step3'] = false;

    if (this.state.rules === '') {
      validate['step2'] = true;
    }

    if (this.state.segment === '') {
      validate['step2'] = true;
    }

    Object.keys(step3).map(key => {
      if (step3[key] === '') {
        validate['step3'] = true;
      }
      return false;
    });

    this.setState({ validate });
  }

  generateDoc(e) {
    e.preventDefault();

    const doc = {
      segmentId: this.state.segment,
      title: this.state.title,
      fromUserId: this.state.fromUser,
      kind: this.state.kind
    };

    if (this.state.kind === 'auto') {
      doc.email = {
        templateId: this.state.email.templateId,
        subject: this.state.email.subject,
        content: this.state.message
      };
    } else if (this.state.kind === 'manual') {
      doc.messenger = {
        brandId: this.state.messenger.brandId,
        kind: this.state.messenger.kind,
        sentAs: this.state.messenger.sentAs,
        content: this.state.message
      };
    } else {
      doc.messenger = {
        rules: this.state.rules,
        brandId: this.state.messenger.brandId,
        sentAs: this.state.messenger.sentAs,
        content: this.state.message
      };
    }

    return doc;
  }

  changeState(key, value) {
    this.setState({ [key]: value });
  }

  next(stepNumber) {
    const { activeStep, maxStep } = this.state;
    this.validate();
    if (stepNumber === 0) {
      if (activeStep <= maxStep) {
        this.setState({ activeStep: activeStep + 1 });
      }
    } else {
      this.setState({ activeStep: stepNumber });
    }
  }

  renderSegmentStep() {
    if (this.state.kind === 'visitorAuto') {
      return (
        <ConditionStep
          rules={this.state.rules}
          changeRules={this.changeState}
        />
      );
    }
    return (
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
    );
  }

  render() {
    const {
      activeStep,
      maxStep,
      validate,
      messenger,
      email,
      fromUser,
      message
    } = this.state;
    const defaultMessageStepValue = { messenger, email, fromUser, message };

    return (
      <StepWrapper>
        <Wrapper.Header
          breadcrumb={[
            { title: 'Engage', link: '/engage' },
            { title: 'New engagement' }
          ]}
        />
        <TitleContainer>
          <div>Title</div>
          <FormControl
            required
            onChange={e => this.changeState('title', e.target.value)}
            defaultValue={this.state.title}
          />
        </TitleContainer>
        <Steps maxStep={maxStep} active={activeStep} validate={validate}>
          <Step
            img="/images/icons/erxes-05.svg"
            title="Choose channel"
            next={this.next}
          >
            <ChannelStep
              changeState={this.changeState}
              kind={this.state.kind}
            />
          </Step>
          <Step
            img="/images/icons/erxes-02.svg"
            title="Who is this message for?"
            next={this.next}
          >
            {this.renderSegmentStep()}
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
              kind={this.state.kind}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

AutoAndManualForm.propTypes = propTypes;

export default AutoAndManualForm;
