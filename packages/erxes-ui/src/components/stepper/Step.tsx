import { __ } from "../../utils/core";
import React from "react";
import {
  FullStep,
  StepContent,
  StepHeader,
  StepHeaderContainer,
  StepHeaderTitle,
  StepItem,
  ButtonBack,
} from "./styles copy";

type Props = {
  stepNumber?: number;
  active?: number;
  title?: string;
  children?: React.ReactNode;
  next?: (stepNumber: number) => void;
  back?: (stepNumber: number) => void;
  message?: any;
  onClick?: (stepNumber: number) => void;
};

class Step extends React.Component<Props> {
  renderButton() {
    const { next, back, active } = this.props;

    if (next || back) {
      return (<div style={{width: 240}}>
        {back && <ButtonBack
          onClick={back.bind(null, 0)}
        >
          {active === 1 ? "Cancel" : "Back"}
        </ButtonBack>}
        {next && <ButtonBack
          onClick={next.bind(null, 0)}
          next={true}
        >
          Next
        </ButtonBack>}
      </div>);
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
    const { stepNumber, active, title, children } = this.props;

    let show = false;

    if (stepNumber === active) {
      show = true;
    }

    return (<>
      <StepItem show={show}>
        <FullStep show={show}>
          {/* <StepHeaderContainer>
            <StepHeader>
              <StepHeaderTitle>{__(title || "")}</StepHeaderTitle>
            </StepHeader>
          </StepHeaderContainer> */}
          <StepContent>{children}</StepContent>
          {this.renderButton()}
        </FullStep>
      </StepItem>
    </>);
  }
}

export default Step;
