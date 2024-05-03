import {
  ButtonContainer,
  ScriptLoader,
  SidebarContent,
} from "modules/saas/onBoarding/styles";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "modules/common/components/Button";
import { IIntegration } from "@erxes/ui-inbox/src/settings/integrations/types";
import Icon from "modules/common/components/Icon";
import React from "react";
import { router } from "modules/common/utils";

type Props = {
  integration: IIntegration;
};

function MessengerScript(props: Props) {
  const { integration = {} as IIntegration } = props;
  const navigate = useNavigate();
  const location = useLocation();

  let next = true;

  if (
    integration.isConnected !== undefined &&
    integration.isConnected !== false
  ) {
    next = false;
  }

  const onChangeStep = () => {
    router.setParams(navigate, location, { steps: 4 });
  };

  const onChangeBack = () => {
    router.setParams(navigate, location, { steps: 2 });
  };

  return (
    <>
      <SidebarContent isCenter={true}>
        <ScriptLoader>
          <div className="spinner">
            <div className="double-bounce1" />
          </div>
          {next ? <h2>Waiting for customer data</h2> : <h2>Next step</h2>}
        </ScriptLoader>
      </SidebarContent>
      <ButtonContainer>
        <Button btnStyle="simple" onClick={onChangeBack} block={true}>
          <Icon icon="leftarrow" size={12} /> &nbsp; Back
        </Button>
        <Button onClick={onChangeStep} block={true} disabled={next}>
          Next &nbsp; <Icon icon="rightarrow" size={12} />
        </Button>
      </ButtonContainer>
    </>
  );
}

export default MessengerScript;
