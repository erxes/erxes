import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  StepItem,
  FullStep,
  StepHeaderContainer,
  StepHeader,
  StepImg,
  StepHeaderTitle,
  StepContent,
  ShortStep
} from './style';

const propTypes = {
  stepNumber: PropTypes.number,
  active: PropTypes.number,
  img: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.any,
  next: PropTypes.func,
  nextButton: PropTypes.object
};

class Step extends Component {
  render() {
    const { __ } = this.context;
    const {
      stepNumber,
      active,
      img,
      title,
      children,
      next,
      nextButton
    } = this.props;

    let show = false;

    if (stepNumber === active) {
      show = true;
    }

    return (
      <StepItem show={show}>
        <FullStep show={show}>
          <StepHeaderContainer>
            <StepHeader>
              <StepImg>
                <img src={img} alt="step-icon" />
              </StepImg>

              <StepHeaderTitle>{__(title)}</StepHeaderTitle>
            </StepHeader>

            {nextButton}
          </StepHeaderContainer>
          <StepContent>{children}</StepContent>
        </FullStep>

        <ShortStep show={!show} onClick={() => next(stepNumber)}>
          <StepImg>
            <img src={img} alt="step-icon" />
          </StepImg>
        </ShortStep>
      </StepItem>
    );
  }
}

Step.propTypes = propTypes;
Step.contextTypes = {
  __: PropTypes.func
};

export default Step;
