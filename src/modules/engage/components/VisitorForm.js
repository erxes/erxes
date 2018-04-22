import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import MessengerForm from './MessengerForm';
import { StepWrapper, TitleContainer } from './step/style';
import { FormControl } from 'modules/common/components';
import { ConditionStep, Steps, Step } from './step';
import { METHODS, MESSAGE_KINDS } from 'modules/engage/constants';
import FormBase from './FormBase';

const propTypes = {
  message: PropTypes.object
};

const contextTypes = {
  __: PropTypes.func
};

class VisitorForm extends FormBase {
  constructor(props) {
    super(props);

    const message = props.message.messenger || {};
    const rules = message.rules ? message.rules.map(rule => ({ ...rule })) : [];
    const validate = props.message.messenger ? false : true;

    this.state = {
      maxStep: 2,
      activeStep: 1,
      validate: {
        step1: validate,
        step2: validate
      },
      method: METHODS.MESSENGER,
      title: props.message.title || '',
      message: message.content || '',
      fromUser: props.message.fromUserId || '',
      rules,
      messenger: {
        brandId: message.brandId || '',
        sentAs: message.sentAs || ''
      }
    };

    this.next = this.next.bind(this);
    this.changeState = this.changeState.bind(this);
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

  validate() {
    const step1 = this.state.rules;
    const step2 = this.state.messenger;
    let validate = { ...this.state.validate };

    validate['step1'] = false;
    validate['step2'] = false;

    if (step1.length < 1) {
      validate['step1'] = true;
    }

    Object.keys(step2).map(key => {
      if (step2[key] === '') {
        validate['step2'] = true;
      }
      return false;
    });

    this.setState({ validate });
  }

  generateDoc(e) {
    e.preventDefault();

    const doc = {
      kind: MESSAGE_KINDS.VISITOR_AUTO,
      title: this.state.title,
      fromUserId: this.state.fromUser,
      method: METHODS.MESSENGER,
      messenger: {
        rules: this.state.rules,
        brandId: this.state.messenger.brandId,
        sentAs: this.state.messenger.sentAs,
        content: this.state.message
      }
    };

    return doc;
  }

  changeState(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    const {
      activeStep,
      maxStep,
      validate,
      messenger,
      fromUser,
      message,
      rules
    } = this.state;
    const { __ } = this.context;
    const defaultMessengerValue = { messenger, fromUser, message, rules };

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={this.renderTitle()} />
        <TitleContainer>
          <div>{__('Title')}</div>
          <FormControl
            onChange={e => this.changeState('title', e.target.value)}
            defaultValue={this.state.title}
          />
        </TitleContainer>
        <Steps maxStep={maxStep} active={activeStep} validate={validate}>
          <Step
            img="/images/icons/erxes-02.svg"
            title="Who is this message for?"
            next={this.next}
          >
            <ConditionStep
              rules={this.state.rules}
              changeRules={this.changeState}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Compose your message"
            save={this.save}
            next={this.next}
            message={this.props.message}
          >
            <MessengerForm
              brands={this.props.brands}
              changeMessenger={this.changeState}
              users={this.props.users}
              hasKind={false}
              defaultValue={defaultMessengerValue}
            />
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

VisitorForm.propTypes = propTypes;
VisitorForm.contextTypes = contextTypes;

export default VisitorForm;
