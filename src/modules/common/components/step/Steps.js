import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StepContainer } from './styles';

const propTypes = {
  children: PropTypes.any.isRequired,
  active: PropTypes.number.isRequired,
  maxStep: PropTypes.number
};

class Steps extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeStep: 1,
      maxStep: 6
    };

    this.next = this.next.bind(this);
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

  render() {
    let { children, maxStep } = this.props;

    return (
      <StepContainer>
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            stepNumber: index + 1,
            active: this.state.activeStep,
            next: this.next,
            maxStep
          });
        })}
      </StepContainer>
    );
  }
}

Steps.propTypes = propTypes;

export default Steps;
