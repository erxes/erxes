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
  ButtonBack,
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

  renderBackButton(text: string) {
    const { back, stepNumber = 1 } = this.props;

    if (back)
      return (
        <ButtonBack size={1} onClick={() => back(stepNumber)}>
          {text}
        </ButtonBack>
      );

    return null;
  }

  renderButton = () => {
    const { next, link, additionalButton, direction } = this.props;

    if (direction === 'horizontal') {
      return (
        <BoxRow>
          {link ? (
            <Link to={link}>{this.renderBackButton(__('Cancel'))}</Link>
          ) : (
            this.renderBackButton(__('Back'))
          )}
          {additionalButton
            ? additionalButton
            : next && (
                <ButtonBack size={1} onClick={() => next && next(0)}>
                  {__('Skip')}
                </ButtonBack>
              )}
        </BoxRow>
      );
    }

    if (next)
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

    return null;
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
