import React from 'react';
import { StepContainer, StepHeaderTitle } from './styles';
import { Link } from 'react-router-dom';
import Button from '../Button';
import { StepWrapper, SteperItem, StepCount } from './styles';
import { __ } from '../../utils/core';

type Props = {
  children: any;
  active?: number;
  maxStep?: number;
  allStep?: number;
  titles?: string[];
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
    const { children, maxStep, titles, allStep, type } = this.props;
    const { activeStep } = this.state;
    let index = 0;
    const count: number[] = [];

    if (allStep) {
      for (var i = 1; i <= allStep; i++) {
        count.push(i);
      }
    }

    return (
      <>
        {type === 'stepper' && (
          <StepWrapper type={type}>
            {count.map(cnt => {
              return (
                <SteperItem complete={activeStep >= cnt}>
                  <StepCount complete={activeStep >= cnt}>{cnt}</StepCount>
                  {titles && (
                    <StepHeaderTitle>{__(titles[cnt - 1])}</StepHeaderTitle>
                  )}
                </SteperItem>
              );
            })}
          </StepWrapper>
        )}
        <StepContainer type={type}>
          {React.Children.map(children, (child: any) => {
            if (!child) {
              return null;
            }

            index++;

            return React.cloneElement(child, {
              stepNumber: index,
              active: this.state.activeStep,
              next: this.next,
              back: this.back,
              maxStep
            });
          })}
        </StepContainer>
      </>
    );
  }
}

export default Steps;
