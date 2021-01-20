import { colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { __ } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';

const WelcomeContent = styled.div`
  width: 280px;
  text-align: center;
  overflow: hidden;

  img {
    width: 100%;
    padding: 20px 10px;
    margin-bottom: 10px;
  }

  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    width: 180px;
    height: 150px;
    z-index: -1;
  }

  &:after {
    border-radius: 100% 30%;
    background-color: ${rgba(colors.colorCoreYellow, 0.13)};
    left: -10px;
    top: -10px;
  }

  &:before {
    background-color: ${rgba(colors.colorCoreRed, 0.1)};
    right: -10px;
    bottom: 80px;
    border-radius: 97% 86%;
  }
`;

type Props = {
  renderButton: (
    text: string,
    onClick,
    icon: string,
    disabled?: boolean
  ) => React.ReactNode;
  currentUserName: string;
  changeStep: () => void;
};

function Welcome({ renderButton, currentUserName, changeStep }: Props) {
  return (
    <WelcomeContent>
      <img alt="welcome" src="/images/actions/welcome.svg" />
      <div>
        <h3>
          {__('Welcome')}, <b>{currentUserName}</b>
        </h3>
        <p>
          {__(
            "We're thrilled to have you on board and can't wait to see you set up your business here already"
          )}
          .
        </p>
      </div>
      {renderButton('Get Started', changeStep, 'arrow-circle-right')}
    </WelcomeContent>
  );
}

export default Welcome;
