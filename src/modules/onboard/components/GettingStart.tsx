import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import * as React from 'react';
import {
  Footer,
  Indicator,
  Item,
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

class GettingStart extends React.PureComponent<Props> {
  render() {
    return (
      <MainContainer>
        <Logo src="/images/logo-dark.png" alt="erxes" />
        <LeftContainer>
          <LeftContent>
            <img src="/images/icons/erxes-03.svg" />
            <h2>Create your brand</h2>

            <Footer>
              <Button btnStyle="link">Back</Button>
              <Button btnStyle="primary">Next</Button>
            </Footer>
          </LeftContent>
        </LeftContainer>
        <RightContent>
          <Indicator>
            <Item data-number="1" active={true}>
              <h4>Create brand</h4>
              <p>
                A qualifying handbook multiplies the promise inside the ultimate
                moan. A sound parades within a paper.{' '}
              </p>
            </Item>

            <Item data-number="2">
              <h4>Create brand</h4>
              <p>
                A qualifying handbook multiplies the promise inside the ultimate
                moan. A sound parades within a paper.{' '}
              </p>
            </Item>

            <Item data-number="3">
              <h4>Create brand</h4>
              <p>
                A qualifying handbook multiplies the promise inside the ultimate
                moan. A sound parades within a paper.{' '}
              </p>
            </Item>

            <Item data-number="4">
              <h4>Create brand</h4>
              <p>
                A qualifying handbook multiplies the promise inside the ultimate
                moan. A sound parades within a paper.{' '}
              </p>
            </Item>
          </Indicator>
        </RightContent>
      </MainContainer>
    );
  }
}

export default GettingStart;
