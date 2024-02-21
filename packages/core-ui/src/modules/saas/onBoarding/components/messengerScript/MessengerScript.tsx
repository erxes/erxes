import React from 'react';
import Icon from 'modules/common/components/Icon';
import Button from 'modules/common/components/Button';
import {
  ButtonContainer,
  ScriptLoader,
  SidebarContent,
} from 'modules/saas/onBoarding/styles';
import { IIntegration } from '@erxes/ui-inbox/src/settings/integrations/types';
import { router } from 'modules/common/utils';

type Props = {
  history: any;
  integration: IIntegration;
};

function MessengerScript(props: Props) {
  const { integration = {} as IIntegration } = props;
  let next = true;

  if (
    integration.isConnected !== undefined &&
    integration.isConnected !== false
  ) {
    next = false;
  }

  const onChangeStep = () => {
    router.setParams(props.history, { steps: 4 });
  };

  const onChangeBack = () => {
    router.setParams(props.history, { steps: 2 });
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
