import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StepItem,
  FullStep,
  StepHeaderContainer,
  StepHeader,
  StepNumber,
  StepTitle,
  StepContent,
  ShortStep
} from './Style2';
import { Button } from 'modules/common/components';

const propTypes = {
  step: PropTypes.number.isRequired,
  currentStep: PropTypes.number.isRequired,
  title: PropTypes.string,
  hasNext: PropTypes.array.isRequired,
  changeStep: PropTypes.func,
  saveLive: PropTypes.func,
  saveDraft: propTypes.func,
  children: propTypes.any
};

class Step extends Component {
  render() {
    let next = (
      <Button.Group>
        <Button btnStyle="warning" size="small" icon="plus">
          Save & Live
        </Button>
        <Button btnStyle="primary" size="small" icon="plus">
          Save & Live
        </Button>
      </Button.Group>
    );

    if (this.props.hasNext) {
      next = (
        <Button btnStyle="default" size="small" icon="ios-arrow-forward">
          Next
        </Button>
      );
    }

    let show = false;

    if (this.props.step === this.props.currentStep) {
      show = true;
    }

    const { step, title, children } = this.props;

    return (
      <StepItem show={show}>
        <FullStep show={show}>
          <StepHeaderContainer>
            <StepHeader>
              <StepNumber>{step}</StepNumber>
              <StepTitle>{title}</StepTitle>
            </StepHeader>
            {next}
          </StepHeaderContainer>
          <StepContent>{children}</StepContent>
        </FullStep>
        <ShortStep show={show}>
          <StepNumber>{step}</StepNumber>
        </ShortStep>
      </StepItem>
    );
  }
}

Step.propTypes = propTypes;

export default Step;
