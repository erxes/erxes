import { Button } from 'modules/common/components';
import * as React from 'react';
import { withRouter } from 'react-router';
import * as RTG from 'react-transition-group';
import { IRouterProps } from '../../common/types';
import { MainContainer, Robot, WelcomeWrapper } from './styles';

interface IProps extends IRouterProps {
  onSuccess: (password: string) => void;
  closeModal: () => void;
}

function Welcome({ history }: IProps) {
  const start = () => {
    history.push('/getting-started');
  };

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
      <RTG.Transition appear={true} in={true} timeout={1300}>
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
              your business attract more engaged customers. Replace Hubspot with
              the mission and community-driven ecosystem.
            </p>
            <Button onClick={start} btnStyle="success" size="large">
              Let's start
            </Button>
            <Robot src="/images/robots/robot-05.svg" />
          </WelcomeWrapper>
        )}
      </RTG.Transition>
    </MainContainer>
  );
}

export default withRouter<IProps>(Welcome);
