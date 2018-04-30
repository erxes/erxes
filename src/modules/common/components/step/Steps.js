import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const propTypes = {
  children: PropTypes.any.isRequired,
  active: PropTypes.number.isRequired
};

const StepContainer = styled.div`
  display: flex;
  height: 100%;
  > *:nth-child(n + 2) {
    margin-left: 5px;
  }
`;

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
    let { children } = this.props;
    //cloning step's children with default state

    return (
      <StepContainer>
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            stepNumber: index + 1,
            active: this.state.activeStep,
            next: this.next
          });
        })}
      </StepContainer>
    );
  }
}

Steps.propTypes = propTypes;

export default Steps;
