import {
  Alert,
  Button,
  ButtonMutate,
  Step,
  Steps,
  Wrapper,
  __
} from "@erxes/ui/src";
import { Content, LeftContent } from "../styles";
import {
  ControlWrapper,
  Indicator,
  StepWrapper
} from "@erxes/ui/src/components/step/styles";
import { IBmsBranch } from "../types";
import GeneralStep from "./step/GeneralStep";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import PermissionStep from "./step/Permission";
import PaymentsStep from "./step/PaymentsStep";
import Appearance from "./step/Appearance";

type Props = {
  branch?: IBmsBranch;
  loading?: boolean;
  isActionLoading: boolean;
  save: (params: any) => void;
};

const BranchEdit = (props: Props) => {
  const { branch = {} as IBmsBranch, loading, isActionLoading, save } = props;

  const [state, setState] = useState<any>({
    ...branch,
    uiOptions: branch.uiOptions || {
      colors: {
        primary: "#FFFFFF",
        secondary: "#6569DF",
        third: "#3CCC38"
      },
      logo: "",
      texts: {}
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!state.name) {
      return Alert.error("Enter name");
    }

    if (!state.user1Ids || !state.user1Ids.length) {
      return Alert.error("Choose general manager users");
    }

    if (!state.user2Ids || !state.user2Ids.length) {
      return Alert.error("Choose managers users");
    }

    let doc: any = {
      name: state.name,
      description: state.description,
      erxesAppToken: state.erxesAppToken,
      user1Ids: state.user1Ids,
      user2Ids: state.user2Ids,
      paymentIds: state.paymentIds || [],
      paymentTypes: state.paymentTypes || [],
      uiOptions: state.uiOptions,
      permissionConfig: state.permissionConfig || {}
    };

    save(doc);
  };

  const onChange = (key: string, value: any) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  };

  const onStepClick = currentStepNumber => {
    let carousel = "form";
    switch (currentStepNumber) {
      case 1:
        carousel = state.isSkip ? "form" : "callout";
        break;
      case 2:
        carousel = state.isSkip ? "form" : "callout";
        break;
      case 3:
        carousel = "success";
        break;
      default:
        break;
    }

    return setState(prevState => ({ ...prevState, carousel }));
  };

  const renderButtons = () => {
    const SmallLoader = ButtonMutate.SmallLoader;

    const cancelButton = (
      <Link to={`/tms`}>
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          disabled={isActionLoading}
          btnStyle="success"
          icon={isActionLoading ? undefined : "check-circle"}
          onClick={handleSubmit}
        >
          {isActionLoading && <SmallLoader />}
          Save
        </Button>
      </Button.Group>
    );
  };

  const breadcrumb = [
    { title: "TMS List", link: `/tms` },
    { title: branch._id ? "Edit" : "Create" }
  ];
  useEffect(() => {
    setState(v => ({ ...branch }));
  }, [branch]);
  return (
    <StepWrapper>
      <Wrapper.Header title={__("Bms")} breadcrumb={breadcrumb} />
      <Content>
        <LeftContent>
          <Steps maxStep={3}>
            <Step
              img="/images/icons/erxes-12.svg"
              title={`General`}
              onClick={onStepClick}
            >
              <GeneralStep onChange={onChange} branch={state} />
            </Step>
            <Step
              img="/images/icons/erxes-12.svg"
              title={__(`Payments`)}
              onClick={onStepClick}
            >
              <PaymentsStep onChange={onChange} branch={state} />
            </Step>
            <Step
              img="/images/icons/erxes-02.svg"
              title={__(`Permission`)}
              onClick={onStepClick}
            >
              <PermissionStep onChange={onChange} branch={state} />
            </Step>
            <Step
              img="/images/icons/erxes-04.svg"
              title={__("Appearance")}
              onClick={onStepClick}
            >
              <Appearance
                onChange={onChange}
                uiOptions={state.uiOptions}
                logoPreviewUrl={state.uiOptions?.logo}
              />
            </Step>
          </Steps>
          <ControlWrapper>
            <Indicator>
              {__("You are")} {state ? "editing" : "creating"}{" "}
              <strong>{state.name || ""}</strong> {__("tms")}
            </Indicator>
            {renderButtons()}
          </ControlWrapper>
        </LeftContent>
      </Content>
    </StepWrapper>
  );
};

export default BranchEdit;
