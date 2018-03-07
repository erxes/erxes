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
  ShortStep,
  StepStatus
} from './style';
import { Icon, Button } from 'modules/common/components';

const propTypes = {
  stepNumber: PropTypes.number,
  maxStep: PropTypes.number,
  active: PropTypes.number,
  img: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.any,
  next: PropTypes.func,
  save: PropTypes.func,
  validate: PropTypes.object,
  message: PropTypes.object
};

class Step extends Component {
  renderButton() {
    const { save, next, message } = this.props;

    if (save && Object.keys(message).length !== 0) {
      return (
        <Button
          btnStyle="primary"
          size="small"
          icon="ios-arrow-forward"
          onClick={e => save('save', e)}
        >
          Save
        </Button>
      );
    } else if (save) {
      return (
        <Button.Group>
          <Button
            btnStyle="warning"
            size="small"
            icon="ios-arrow-forward"
            onClick={e => save('draft', e)}
          >
            Save & Draft
          </Button>
          <Button
            btnStyle="primary"
            size="small"
            icon="ios-arrow-forward"
            onClick={e => save('live', e)}
          >
            Save & Live
          </Button>
        </Button.Group>
      );
    }
    return (
      <Button
        btnStyle="primary"
        size="small"
        icon="ios-arrow-forward"
        onClick={() => next(0)}
      >
        Next
      </Button>
    );
  }

  render() {
    const {
      stepNumber,
      active,
      img,
      title,
      children,
      next,
      validate
    } = this.props;
    const { __ } = this.context;

    let show = false;

    if (stepNumber === active) {
      show = true;
    }
    const button = this.renderButton();

    let status = 'checkmark';
    if (validate[`step${stepNumber}`]) {
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
              <StepHeaderTitle>{__(title)}</StepHeaderTitle>
            </StepHeader>
            {button}
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
Step.contextTypes = {
  __: PropTypes.func
};

export default Step;
