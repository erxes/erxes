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
import { Link } from 'react-router-dom';
import Button from '../Button';
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
      maxStep: 6
    };
  }

  next = (stepNumber: number) => {
    const { activeStep, maxStep } = this.state;

    if (stepNumber === 0) {
      if (activeStep <= maxStep) this.setState({ activeStep: activeStep + 1 });
    } else this.setState({ activeStep: stepNumber });
  };

  back = (stepNumber: number) => {
    const { activeStep } = this.state;

    if (stepNumber === 1) {
      <Link to="settings/importHistories">
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>;
    } else this.setState({ activeStep: activeStep - 1 });
  };

  renderContent = () => {
    const { direction, children, maxStep } = this.props;

    const { activeStep } = this.state;

    if (direction === 'horizontal') {
      let headerElements: any = [];

      let childrenElements = React.Children.map(
        children,
        (child: any, index: number) => {
          headerElements.push(
            <ShortStep
              show={true}
              active={activeStep >= index + 1}
              direction={direction}
              onClick={() => this.next(index + 1)}
            >
              <StepCount direction={direction} active={activeStep >= index + 1}>
                {index + 1}
              </StepCount>
              <StepHeaderTitle>{__(child.props.title || '')}</StepHeaderTitle>
            </ShortStep>
          );

          return React.cloneElement(child, {
            stepNumber: index + 1,
            active: activeStep,
            next: this.next,
            // back: this.back,
            direction,
            maxStep
          });
        }
      );

      return (
        <StepItem show={true}>
          <StepHeaderHorizontalContainer>
            {headerElements}
          </StepHeaderHorizontalContainer>
          <StepContent direction={direction}>{childrenElements}</StepContent>
        </StepItem>
      );
    }

    return React.Children.map(children, (child: any, index: number) =>
      React.cloneElement(child, {
        stepNumber: index + 1,
        active: activeStep,
        next: this.next,
        back: this.back,
        direction,
        maxStep
      })
    );
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
