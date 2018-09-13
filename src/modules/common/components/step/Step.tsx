import { Button, Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import React, { Component } from 'react';
import {
  FullStep,
  ShortStep,
  StepContent,
  StepHeader,
  StepHeaderContainer,
  StepHeaderTitle,
  StepImg,
  StepItem
} from './styles';

type Props = {
  stepNumber?: number,
  active?: number,
  img?: string,
  title?: string,
  children?: any,
  next?: (number: number) => void,
  nextButton?: any,
  save?: (name: string, e: React.MouseEvent) => void,
  message?: any
};

class Step extends Component<Props> {
  renderButton() {
    const { save, next, message } = this.props;

    if (save && Object.keys(message).length !== 0) {
      return (
        <Button
          btnStyle="success"
          size="small"
          icon="checked-1"
          onClick={e => save('save', e)}
        >
          Save
        </Button>
      );
    }

    if (save) {
      return (
        <Button.Group>
          <Button
            btnStyle="warning"
            size="small"
            icon="rightarrow-2"
            onClick={e => save('draft', e)}
          >
            Save & Draft
          </Button>
          <Button
            btnStyle="success"
            size="small"
            icon="checked-1"
            onClick={e => save('live', e)}
          >
            Save & Live
          </Button>
        </Button.Group>
      );
    }

    return (
      <Button
        btnStyle="primary"
        size="small"
        icon="rightarrow-2"
        onClick={() => next(0)}
      >
        Next
      </Button>
    );
  }

  renderNextButton() {
    const { __ } = this.context;

    return (
      <Button
        btnStyle="primary"
        size="small"
        onClick={() => this.props.next(0)}
      >
        {__('Next')} <Icon icon="rightarrow-2" />
      </Button>
    );
  }

  render() {
    const {
      stepNumber,
      active,
      img,
      title,
      children,
      next,
      nextButton
    } = this.props;

    let show = false;

    if (stepNumber === active) {
      show = true;
    }

    return (
      <StepItem show={show}>
        <FullStep show={show}>
          <StepHeaderContainer>
            <StepHeader>
              <StepImg>
                <img src={img} alt="step-icon" />
              </StepImg>

              <StepHeaderTitle>{__(title)}</StepHeaderTitle>
            </StepHeader>
            {nextButton || this.renderButton()}
          </StepHeaderContainer>

          <StepContent>{children}</StepContent>
        </FullStep>

        <ShortStep show={!show} onClick={() => next(stepNumber)}>
          <StepImg>
            <img src={img} alt="step-icon" />
          </StepImg>
        </ShortStep>
      </StepItem>
    );
  }
}

export default Step;
