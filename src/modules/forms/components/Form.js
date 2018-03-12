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
      title: 'Contact',
      bodyValue: 'Body description here',
      btnText: 'Send',
      color: '#04A9F5',
      theme: '#04A9F5',
      logoPreviewUrl: '',
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

  next(stepNumber) {
    const { activeStep, maxStep } = this.state;

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
    const {
      activeStep,
      hasOptions,
      title,
      kind,
      btnText,
      bodyValue,
      color,
      theme,
      logoPreviewUrl
    } = this.state;
    const integration = this.props.integration || {};
    const { __ } = this.context;
    const breadcrumb = [{ title: __('Forms'), link: '/forms' }];

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
            <ChooseType changeState={this.changeState} kind={kind} />
          </Step>
          <Step
            img="/images/icons/erxes-02.svg"
            title="CallOut"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <CallOut
              changeState={this.changeState}
              integration={integration}
              kind={kind}
            />
          </Step>
          <Step
            img="/images/icons/erxes-08.svg"
            title="Form"
            next={this.next}
            nextButton={this.renderNextButton()}
          >
            <FormStep
              title={title}
              btnText={btnText}
              bodyValue={bodyValue}
              hasOptions={hasOptions}
              kind={kind}
              color={color}
              theme={theme}
              image={logoPreviewUrl}
            />
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
Form.contextTypes = {
  __: PropTypes.func
};

export default Form;
