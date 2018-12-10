import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import * as React from 'react';
import {
  LeftContainer,
  LeftContent,
  Logo,
  MainContainer,
  RightContent
} from './styles';

type Props = {
  onSuccess: (password: string) => void;
  closeModal: () => void;
};

class CreateBrand extends React.PureComponent<Props> {
  render() {
    return (
      <MainContainer>
        <Logo src="/images/logo-dark.png" alt="erxes" />
        <LeftContainer>
          <LeftContent>Left</LeftContent>
        </LeftContainer>
        <RightContent>Right</RightContent>
      </MainContainer>
    );
  }
}

export default CreateBrand;
