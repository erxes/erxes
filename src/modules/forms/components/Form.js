import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { ChooseType, Steps, Step } from './step';
import { StepWrapper } from '../styles';

const propTypes = {
  integrations: PropTypes.array.isRequired,
  loading: PropTypes.bool
};

class Form extends Component {
  constructor(props) {
    super(props);

    const data = props.integrations.formData || {};

    this.state = {
      activeStep: 1,
      maxStep: 3,
      kind: data.loadType || 'shoutbox',
      segment: '',
      validate: {
        step1: false,
        step2: true,
        step3: false
      }
    };

    this.next = this.next.bind(this);
    this.changeState = this.changeState.bind(this);
  }

  validate() {
    let validate = { ...this.state.validate };
    validate['step2'] = false;
    validate['step3'] = false;

    if (this.state.segment === '') {
      validate['step2'] = true;
    }

    this.setState({ validate });
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

  changeState(key, value) {
    this.setState({ [key]: value });
  }

  render() {
    const { activeStep, maxStep } = this.state;

    const breadcrumb = [{ title: 'Forms', link: '/forms' }, { title: 'Flow' }];

    return (
      <StepWrapper>
        <Wrapper.Header breadcrumb={breadcrumb} />
        <Steps maxStep={maxStep} active={activeStep} validate="true">
          <Step
            img="/images/icons/erxes-05.svg"
            title="Choose a flow type"
            next={this.next}
          >
            <ChooseType changeState={this.changeState} kind={this.state.kind} />
          </Step>
          <Step
            img="/images/icons/erxes-02.svg"
            title="Who is this message for?"
            next={this.next}
          >
            <div>hi step 2</div>
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Compose your message"
            save={this.save}
            next={this.next}
          >
            <div>hi step 3</div>
          </Step>
        </Steps>
      </StepWrapper>
    );
  }
}

Form.propTypes = propTypes;

export default Form;
