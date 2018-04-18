import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'modules/common/components';
import {
  StepItem,
  FullStep,
  StepHeaderContainer,
  StepHeader,
  StepImg,
  StepHeaderTitle,
  StepContent,
  ShortStep
} from './styles';

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
  renderNextButton() {
    const { __ } = this.context;

    return (
      <Button
        btnStyle="primary"
        size="small"
        onClick={() => this.props.next(0)}
      >
        {__('Next')} <Icon erxes icon="rightarrow-2" />
      </Button>
    );
  }

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

            {nextButton || this.renderNextButton()}
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
