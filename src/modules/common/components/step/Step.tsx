import { Button, Icon } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
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
  stepNumber?: number;
  active?: number;
  img?: string;
  title?: string;
  children?: React.ReactNode;
  next?: (stepNumber: number) => void;
  nextButton?: React.ReactNode;
  save?: (name: string, e: React.MouseEvent) => void;
  message?: any;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

class Step extends React.Component<Props> {
  renderButton() {
    const { save, next, message } = this.props;

    if (save && Object.keys(message).length !== 0) {
      return (
        <Button
          btnStyle="success"
          size="small"
          icon="checked-1"
          onClick={save.bind(this, 'save')}
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
            onClick={save.bind(this, 'draft')}
          >
            Save & Draft
          </Button>
          <Button
            btnStyle="success"
            size="small"
            icon="checked-1"
            onClick={save.bind(this, 'live')}
          >
            Save & Live
          </Button>
        </Button.Group>
      );
    }

    if (next) {
      return (
        <Button
          btnStyle="primary"
          size="small"
          icon="rightarrow-2"
          onClick={next.bind(null, 0)}
        >
          Next
        </Button>
      );
    }

    return null;
  }

  renderNextButton() {
    const { next } = this.props;

    if (!next) {
      return null;
    }

    return (
      <Button btnStyle="primary" size="small" onClick={next.bind(null, 0)}>
        {__('Next')} <Icon icon="rightarrow-2" />
      </Button>
    );
  }

  onClickNext = (stepNumber?: number) => {
    const { next } = this.props;

    if (next && stepNumber) {
      return next(stepNumber);
    }
  };

  render() {
    const {
      stepNumber,
      active,
      img,
      title,
      children,
      nextButton,
      onClick
    } = this.props;

    let show = false;

    if (stepNumber === active) {
      show = true;
    }

    return (
      <StepItem show={show} onClick={onClick}>
        <FullStep show={show}>
          <StepHeaderContainer>
            <StepHeader>
              <StepImg>
                <img src={img} alt="step-icon" />
              </StepImg>

              <StepHeaderTitle>{__(title || '')}</StepHeaderTitle>
            </StepHeader>
            {nextButton || this.renderButton()}
          </StepHeaderContainer>

          <StepContent>{children}</StepContent>
        </FullStep>

        <ShortStep
          show={!show}
          onClick={this.onClickNext.bind(null, stepNumber)}
        >
          <StepImg>
            <img src={img} alt="step-icon" />
          </StepImg>
        </ShortStep>
      </StepItem>
    );
  }
}

export default Step;
