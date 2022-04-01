import { __ } from "../../utils/core";
import React from "react";
import { FullStep, StepContent, StepItem, ButtonBack } from "./styles";
import { Link } from "react-router-dom";

type Props = {
  stepNumber?: number;
  active?: number;
  title?: string;
  children?: React.ReactNode;
  next?: (stepNumber: number) => void;
  back?: (stepNumber: number) => void;
  message?: any;
  onClick?: (stepNumber: number) => void;
  link?: string;
  additionalButton?: React.ReactNode;
};

class Step extends React.Component<Props> {
  renderButton() {
    const { next, back, active, link, additionalButton } = this.props;

    if (next || back) {
      return (
        <div style={{ width: 240 }}>
          {back && link ? (
            <Link to={link}>
              <ButtonBack onClick={back.bind(null, 0)}>
                {active === 1 ? "Cancel" : "Back"}
              </ButtonBack>
            </Link>
          ) : (
            back && (
              <ButtonBack onClick={back.bind(null, 0)}>
                {active === 1 ? "Cancel" : "Back"}
              </ButtonBack>
            )
          )}
          {next && additionalButton ? additionalButton : next &&(
            <ButtonBack onClick={next.bind(null, 0)} next={true}>
              Next
            </ButtonBack>
          )}
        </div>
      );
    }

    return null;
  }

  onClickNext = (stepNumber?: number) => {
    const { next, onClick } = this.props;

    if (next && stepNumber) {
      onClick && onClick(stepNumber);

      return next(stepNumber);
    }
  };

  render() {
    const { stepNumber, active, children } = this.props;

    let show = false;

    if (stepNumber === active) {
      show = true;
    }

    return (
      <>
        <StepItem show={show}>
          <FullStep show={show}>
            <StepContent>{children}</StepContent>
            {this.renderButton()}
          </FullStep>
        </StepItem>
      </>
    );
  }
}

export default Step;
