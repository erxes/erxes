import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'modules/common/components';
import {
  StepItem,
  FullStep,
  StepHeaderContainer,
  StepHeader,
  StepImg,
  StepHeaderTitle,
  StepContent,
  ShortStep,
  StepStatus
} from './style';

const propTypes = {
  stepNumber: PropTypes.number,
  active: PropTypes.number,
  img: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.any,
  next: PropTypes.func,
  validate: PropTypes.bool,
  nextButton: PropTypes.object
};

class Step extends Component {
  render() {
    const {
      stepNumber,
      active,
      img,
      title,
      children,
      next,
      validate,
      nextButton
    } = this.props;

    let show = false;

    if (stepNumber === active) {
      show = true;
    }

    let status = 'checkmark';

    if (validate) {
      status = 'close';
    }

    return (
      <StepItem show={show}>
        <FullStep show={show}>
          <StepHeaderContainer>
            <StepHeader>
              <StepImg>
                <img src={img} alt="step-icon" />
              </StepImg>
              <StepHeaderTitle>{title}</StepHeaderTitle>
            </StepHeader>
            {nextButton}
          </StepHeaderContainer>
          <StepContent>{children}</StepContent>
        </FullStep>
        <ShortStep show={!show} onClick={() => next(stepNumber)}>
          <StepImg>
            <img src={img} alt="step-icon" />
          </StepImg>
          <StepStatus>
            <Icon icon={status} />
          </StepStatus>
        </ShortStep>
      </StepItem>
    );
  }
}

Step.propTypes = propTypes;

export default Step;
