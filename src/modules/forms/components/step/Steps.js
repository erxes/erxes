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
  render() {
    let { children, active } = this.props;
    //cloning step's children with default state
    return (
      <StepContainer>
        {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {
            stepNumber: index + 1,
            active
          });
        })}
      </StepContainer>
    );
  }
}

Steps.propTypes = propTypes;

export default Steps;
