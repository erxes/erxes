import React from 'react';
import Icon from 'modules/common/components/Icon';
import Button from 'modules/common/components/Button';
import {
  ButtonContainer,
  SidebarContent,
} from 'modules/saas/onBoarding/styles';

type Props = {
  submit: () => void;
};

function OnBoardingDone(props: Props) {
  const { submit } = props;

  const onSubmit = () => {
    return submit();
  };

  return (
    <>
      <SidebarContent />
      <ButtonContainer>
        <Button onClick={onSubmit} block={true}>
          Go to my organization &nbsp; <Icon icon="rightarrow" size={12} />
        </Button>
      </ButtonContainer>
    </>
  );
}

export default OnBoardingDone;
