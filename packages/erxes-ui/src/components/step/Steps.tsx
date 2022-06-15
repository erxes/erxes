import React from 'react';
import {
  StepContainer,
  ShortStep,
  StepCount,
  StepContent,
  StepHeaderHorizontalContainer,
  StepHeaderTitle,
  StepItem
} from './styles';
import { __ } from '../../utils/core';

type Props = {
  children: any;
  active?: number;
  maxStep?: number;
  direction?: 'vertical' | 'horizontal';
};

type State = {
  activeStep: number;
  maxStep: number;
};

class Steps extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activeStep: props.active ? props.active : 1,
      maxStep: props.maxStep ? props.maxStep : 6
    };
  }

  next = (stepNumber: number) => {
    const { activeStep, maxStep } = this.state;

    if (stepNumber === 0) {
      if (activeStep <= maxStep) this.setState({ activeStep: activeStep + 1 });
    } else this.setState({ activeStep: stepNumber });
  };

  back = (stepNumber: number) => {
    const { activeStep, maxStep } = this.state;

    if (stepNumber !== 0) {
      if (activeStep <= maxStep) this.setState({ activeStep: activeStep - 1 });
    } else this.setState({ activeStep: stepNumber });
  };

  renderContent = () => {
    const { direction, children, maxStep } = this.props;
    const { activeStep } = this.state;

    let index: number = 0;

    if (direction === 'horizontal') {
      let headerElements: any = [];

      let childrenElements = React.Children.map(children, (child: any) => {
        if (!child) return null;
        let _index = index;

        index++;

        headerElements.push(
          <ShortStep
            show={true}
            active={activeStep >= index}
            direction={direction}
            onClick={() => this.next(_index + 1)}
          >
            <StepCount direction={direction} active={activeStep >= index}>
              {index}
            </StepCount>
            <StepHeaderTitle>{__(child.props.title || '')}</StepHeaderTitle>
          </ShortStep>
        );

        return React.cloneElement(child, {
          stepNumber: index,
          active: activeStep,
          next: this.next,
          back: this.back,
          direction,
          maxStep
        });
      });

      return (
        <StepItem direction={direction} show={true}>
          <StepHeaderHorizontalContainer>
            {headerElements}
          </StepHeaderHorizontalContainer>
          <StepContent direction={direction}>{childrenElements}</StepContent>
        </StepItem>
      );
    }

    return React.Children.map(children, (child: any) => {
      if (!child) return null;

      index++;

      return React.cloneElement(child, {
        stepNumber: index,
        active: activeStep,
        progress: this.props.active,
        next: this.next,
        back: this.back,
        direction,
        maxStep
      });
    });
  };

  render() {
    return (
      <StepContainer direction={this.props.direction}>
        {this.renderContent()}
      </StepContainer>
    );
  }
}

export default Steps;
