import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Button, Icon } from 'modules/common/components';
import {
  ChooseType,
  Steps,
  Step,
  CallOut,
  FormStep,
  SuccessStep
} from './step';
import { StepWrapper } from '../styles';

const propTypes = {
  integration: PropTypes.object,
  loading: PropTypes.bool
};

class Form extends Component {
  constructor(props) {
    super(props);

    const data = props.integration || {};

    this.state = {
      activeStep: 1,
      maxStep: 5,
      kind: data.loadType || 'shoutbox',
      segment: '',
      hasOptions: false,
      validate: {
        step1: false,
        step2: true,
        step3: true
      }
    };

    this.next = this.next.bind(this);
    this.changeState = this.changeState.bind(this);
  }

  renderNextButton() {
    return (
      <Button btnStyle="primary" size="small" onClick={() => this.next(0)}>
        Next <Icon icon="ios-arrow-forward" />
      </Button>
    );
  }

  checkValidate() {
    let validate = Object.assign({}, this.state.validate);
    const {
      kind,
      segment,
      rules,
      fromUser,
      message,
      messenger,
      email
    } = this.state;
    if (kind === 'auto' || kind === 'manual') {
      if (segment === '') {
        validate['step2'] = true;
      } else {
        validate['step2'] = false;
      }
    } else if (kind === 'visitorAuto') {
      if (rules.length > 0) {
        validate['step2'] = false;
      } else {
        validate['step2'] = true;
      }
    }

    if (kind === 'auto') {
      if (
        messenger.brandId === '' ||
        messenger.kind === '' ||
        messenger.sentAs === '' ||
        fromUser === '' ||
        message === ''
      ) {
        validate['step3'] = true;
      } else {
        validate['step3'] = false;
      }
    } else if (kind === 'visitorAuto') {
      if (
        messenger.brandId === '' ||
        messenger.sentAs === '' ||
        fromUser === '' ||
        message === ''
      ) {
        validate['step3'] = true;
      } else {
        validate['step3'] = false;
      }
    } else if (kind === 'manual') {
      if (
        email.subject === '' ||
        email.templateId === '' ||
        fromUser === '' ||
        message === ''
      ) {
        validate['step3'] = true;
      } else {
        validate['step3'] = false;
      }
    }
    this.setState({ validate });
  }

  next(stepNumber) {
    const { activeStep, maxStep } = this.state;
    this.checkValidate();

    if (stepNumber === 0) {
      if (activeStep <= maxStep) {
        this.setState({ activeStep: activeStep + 1 });
      }
    } else {
      this.setState({ activeStep: stepNumber });
    }
  }

  changeState(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    const { activeStep, hasOptions } = this.state;
    const integration = this.props.integration || {};

    const breadcrumb = [{ title: 'Forms', link: '/forms' }, { title: 'Flow' }];

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />
        <Steps active={activeStep}>
          <Step
            img="/images/icons/erxes-05.svg"
            title="Type"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <ChooseType changeState={this.changeState} kind={this.state.kind} />
          </Step>
          <Step
            img="/images/icons/erxes-02.svg"
            title="CallOut"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <CallOut integration={integration} />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Form"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <FormStep hasOptions={hasOptions} />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Thank content"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <SuccessStep />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Full Preview"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <div>hi step 5</div>
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

Form.propTypes = propTypes;

export default Form;
