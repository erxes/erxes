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

    return (
      <StepContainer>
        {React.Children.map(children, (child: any, index: number) => {
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

export default Steps;
