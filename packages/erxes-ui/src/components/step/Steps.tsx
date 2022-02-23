import React from 'react';
import { StepContainer } from './styles';

type Props = {
  children: any;
  active?: number;
  maxStep?: number;
};

type State = {
  activeStep: number;
  maxStep: number;
};

class Steps extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activeStep: props.active || 1,
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

  render() {
    const { children, maxStep } = this.props;
    let index = 0;

    return (
      <StepContainer>
        {React.Children.map(children, (child: any) => {
          if (!child) {
            return null;
          }

          index++;

          return React.cloneElement(child, {
            stepNumber: index,
            active: this.state.activeStep,
            next: this.next,
            maxStep
          });
        })}
      </StepContainer>
    );
  }
}

export default Steps;
