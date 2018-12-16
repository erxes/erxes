import { Button } from 'modules/common/components';
import * as React from 'react';
import * as RTG from 'react-transition-group';
import { MainContainer, Robot, WelcomeWrapper } from './styles';

type Props = {
  onSuccess: (password: string) => void;
  closeModal: () => void;
};

class Welcome extends React.PureComponent<Props> {
  render() {
    const defaultStyle = {
      transition: `opacity 1300ms ease-in-out`,
      opacity: 0
    };

    const transitionStyles = {
      entering: { opacity: 1 },
      entered: { opacity: 1 }
    };

    return (
      <MainContainer>
        <RTG.Transition in={true} timeout={1300}>
          {state => (
            <WelcomeWrapper
              style={{
                ...defaultStyle,
                ...transitionStyles[state]
              }}
            >
              <img src="/images/logo-dark.png" alt="erxes" />
              <h1>Welcome to erxes</h1>
              <p>
                Marketing, sales, and customer service platform designed to help
                your business attract more engaged customers. Replace Hubspot
                with the mission and community-driven ecosystem.
              </p>
              <Button btnStyle="success" size="large">
                Let's start
              </Button>
              <Robot src="/images/robots/robot-05.svg" />
            </WelcomeWrapper>
          )}
        </RTG.Transition>
      </MainContainer>
    );
  }
}

export default Welcome;
