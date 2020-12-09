import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import { __ } from 'modules/common/utils';
import React from 'react';
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
  noButton?: boolean;
  message?: any;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

class Step extends React.Component<Props> {
  renderButton() {
    const { next } = this.props;

    if (next) {
      return (
        <Button
          btnStyle="primary"
          size="small"
          icon="arrow-right"
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
        {__('Next')} <Icon icon="arrow-right" />
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
      noButton,
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
            {!noButton && this.renderButton()}
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
