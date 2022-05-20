import React from 'react';
import { StepContainer, StepHeaderTitle } from './styles';
import { Link } from 'react-router-dom';
import Button from '../Button';
import { StepWrapper, SteperItem, StepCount, StepContent } from './styles';
import { __ } from '../../utils/core';

type Props = {
  children: any;
  active?: number;
  maxStep?: number;
  type?: string;
};

type State = {
  activeStep: number;
  maxStep: number;
};

class Steps extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activeStep: props.active || 0,
      maxStep: 6
    };
  }

  next = stepNumber => {
    const { activeStep, maxStep } = this.state;

    if (stepNumber === 0) {
      if (activeStep <= maxStep) {
        this.setState({ activeStep: activeStep + 1 });
      }
    } else {
      this.setState({ activeStep: stepNumber });
    }
  };

  back = stepNumber => {
    const { activeStep } = this.state;
    if (stepNumber === 1) {
      <Link to="settings/importHistories">
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>;
    } else {
      this.setState({ activeStep: activeStep - 1 });
    }
  };

  render() {
    const { children, maxStep, type } = this.props;
    const { activeStep } = this.state;

    return (
      <>
        {type === 'stepper' || type === 'stepperColumn' ? (
          <StepWrapper type={type}>
            {React.Children.map(children, (child: any, index: number) => {
              if (!child) {
                return null;
              }

              const element = React.cloneElement(child, {
                stepNumber: index,
                active: activeStep,
                next: this.next,
                maxStep
              });

              return (
                <SteperItem
                  key={index}
                  complete={activeStep >= index}
                  type={type}
                >
                  <StepCount complete={activeStep >= index} type={type}>
                    {index + 1}
                  </StepCount>
                  <StepHeaderTitle type={type}>
                    {child.props.title}
                    {activeStep === index ? element : ''}
                  </StepHeaderTitle>
                </SteperItem>
              );
            })}
          </StepWrapper>
        ) : (
          <StepContainer type={type}>
            {React.Children.map(children, (child: any, index: number) => {
              if (!child) {
                return null;
              }

              return React.cloneElement(child, {
                stepNumber: index,
                active: this.state.activeStep,
                next: this.next,
                back: this.back,
                maxStep
              });
            })}
          </StepContainer>
        )}
      </>
    );
  }
}

export default Steps;
