import Button from '../Button';
import { __ } from '../../utils/core';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  FullStep,
  ShortStep,
  StepCount,
  StepContent,
  StepHeader,
  StepHeaderContainer,
  StepHeaderTitle,
  StepImg,
  StepItem,
  StepButton,
  ButtonContainer
} from './styles';

import { BoxRow } from './style';

type Props = {
  stepNumber?: number;
  active?: number;
  img?: string;
  title?: string;
  children?: React.ReactNode;
  back?: (stepNumber: number) => void;
  next?: (stepNumber: number) => void;
  noButton?: boolean;
  message?: any;
  onClick?: (stepNumber: number) => void;
  link?: string;
  additionalButton?: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  progress?: number;
};

class Step extends React.Component<Props> {
  handleOnClick = (stepNumber?: number) => {
    const { next, onClick } = this.props;

    if (next && stepNumber) {
      onClick && onClick(stepNumber);

      next && next(stepNumber);
    }
  };

  renderBackButton = () => {
    const { back, link, stepNumber = 1 } = this.props;

    if (link)
      return (
        <Link to={link}>
          <StepButton>{__('Cancel')}</StepButton>
        </Link>
      );

    return (
      <StepButton onClick={() => back && back(stepNumber)}>
        {__('Back')}
      </StepButton>
    );
  };

  renderNextButton = () => {
    const { next, additionalButton, direction } = this.props;

    if (additionalButton) return additionalButton;

    if (direction === 'horizontal')
      return (
        <StepButton next={true} onClick={() => next && next(0)}>
          {__('Next')}
        </StepButton>
      );

    return (
      <Button
        btnStyle="primary"
        size="small"
        icon="arrow-right"
        onClick={() => next && next(0)}
      >
        Next
      </Button>
    );
  };

  renderButton = () => {
    const { direction } = this.props;

    if (direction === 'horizontal')
      return (
        <BoxRow>
          {this.renderBackButton()}
          {this.renderNextButton()}
        </BoxRow>
      );

    return this.renderNextButton();
  };

  renderImage = () => {
    const { img } = this.props;

    if (!img) {
      return null;
    }

    return (
      <StepImg>
        <img src={img} alt="step-icon" />
      </StepImg>
    );
  };

  render() {
    const {
      stepNumber,
      active,
      title,
      children,
      noButton,
      direction,
      progress = 0
    } = this.props;

    let show = false;

    if (stepNumber === active) show = true;

    switch (direction) {
      case 'vertical':
        if (active && stepNumber)
          return (
            <StepItem
              show={show}
              direction={direction}
              active={progress >= stepNumber}
            >
              <ShortStep
                show={true}
                active={active >= stepNumber}
                direction={direction}
                onClick={() => this.handleOnClick(stepNumber)}
              >
                <StepCount
                  direction={direction}
                  active={progress >= stepNumber}
                >
                  {stepNumber}
                </StepCount>
                <StepHeaderTitle>{__(title || '')}</StepHeaderTitle>
              </ShortStep>

              <FullStep show={show} direction={direction}>
                <StepContent direction={direction}>
                  {children}
                  {!noButton && this.renderButton()}
                </StepContent>
              </FullStep>
            </StepItem>
          );
        return null;

      case 'horizontal':
        if (active && stepNumber)
          return (
            <StepItem
              show={show}
              direction={direction}
              active={active >= stepNumber}
            >
              <FullStep show={show} direction={direction}>
                <StepContent direction={direction}>
                  {children}
                  <ButtonContainer>
                    {!noButton && this.renderButton()}
                  </ButtonContainer>
                </StepContent>
              </FullStep>
            </StepItem>
          );
        return null;

      default:
        return (
          <StepItem show={show}>
            <FullStep show={show}>
              <StepHeaderContainer>
                <StepHeader>
                  {this.renderImage()}

                  <StepHeaderTitle>{__(title || '')}</StepHeaderTitle>
                </StepHeader>
                {!noButton && this.renderButton()}
              </StepHeaderContainer>

              <StepContent>{children}</StepContent>
            </FullStep>

            <ShortStep
              show={!show}
              onClick={() => this.handleOnClick(stepNumber)}
            >
              {this.renderImage()}
            </ShortStep>
          </StepItem>
        );
    }
  }
}

export default Step;
