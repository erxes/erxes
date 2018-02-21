import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const propTypes = {
  maxStep: PropTypes.number.isRequired,
  children: PropTypes.any.isRequired,
  active: PropTypes.number.isRequired,
  validate: PropTypes.object
};

const StepContainer = styled.div`
  display: flex;
  height: 100%;
  > *:nth-child(n + 2) {
    margin-left: 5px;
  }
`;

class Steps extends Component {
  render() {
    let { maxStep, children, active, validate } = this.props;
    //cloning step's children with default state
    return (
      <StepContainer>
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            stepNumber: index + 1,
            active,
            maxStep,
            validate
          });
        })}
      </StepContainer>
    );
  }
}

Steps.propTypes = propTypes;

export default Steps;
