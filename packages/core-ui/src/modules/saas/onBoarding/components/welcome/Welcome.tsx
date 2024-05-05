import { useLocation, useNavigate } from "react-router-dom";

import Button from "modules/common/components/Button";
import React from "react";
import { WelcomeContainer } from "modules/saas/onBoarding/styles";
import { router } from "@erxes/ui/src/utils";

const Welcome = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onChangeStep = () => {
    router.setParams(navigate, location, { steps: 1 });
  };

  return (
    <WelcomeContainer>
      <img className="logo" src="/images/logo-dark.png" />
      <h1>
        <b>
          What you can do with <br />
          XM for SaaS
        </b>
      </h1>
      <Button onClick={onChangeStep}>Let's start</Button>
    </WelcomeContainer>
  );
};

export default Welcome;
