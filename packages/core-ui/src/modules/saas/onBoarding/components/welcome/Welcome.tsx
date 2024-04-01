import React from 'react';
import { WelcomeContainer } from 'modules/saas/onBoarding/styles';
import Button from 'modules/common/components/Button';
import { router } from '@erxes/ui/src/utils';

type Props = {
  history: any;
};

const Welcome = ({ history }: Props) => {
  const onChangeStep = () => {
    router.setParams(history, { steps: 1 });
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
