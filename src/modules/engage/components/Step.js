import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StepWrapper,
  ShortStep,
  StepNumber,
  FullStep,
  StepHeader,
  NextButton,
  StepContent
} from './step1/Style.js';
import { Icon } from 'modules/common/components';
import Step1 from './step1/Step1';
import Step2 from './step1/Step2';

const propTypes = {
  segments: PropTypes.array.isRequired,
  templates: PropTypes.array,
  brands: PropTypes.array,
  counts: PropTypes.object
};

class Step extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1,
      method: 'email',
      segment: ''
    };
    this.changeMethod = this.changeMethod.bind(this);
    this.changeSegment = this.changeSegment.bind(this);
  }

  changeMethod(method) {
    this.setState({ method });
  }

  changeSegment(segment) {
    this.setState({ segment });
    console.log(this.state.segment);
  }

  showStep(step) {
    this.setState({ step });
  }

  renderStep(step, hasNext, content) {
    let next = '';

    if (hasNext) {
      next = (
        <NextButton onClick={() => this.showStep(step + 1)}>
          <span>Next</span>
          <Icon icon="ios-arrow-forward" />
        </NextButton>
      );
    }

    if (this.state.step === step) {
      return (
        <FullStep>
          <StepHeader>
            <StepNumber>{step}</StepNumber>
            {next}
          </StepHeader>
          <StepContent>{content}</StepContent>
        </FullStep>
      );
    }

    return (
      <ShortStep onClick={() => this.showStep(step)}>
        <StepNumber>{step}</StepNumber>
      </ShortStep>
    );
  }
  //  {this.renderStep(1, true, <Step1 changeMethod={this.changeMethod} method={this.state.method}/>)}
  render() {
    return (
      <StepWrapper>
        {this.renderStep(
          2,
          true,
          <Step2
            changeSegment={this.changeMethod}
            segments={this.props.segments}
          />
        )}
        {this.renderStep(3, false)}
      </StepWrapper>
    );
  }
}

Step.propTypes = propTypes;

export default Step;
