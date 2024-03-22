import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import {
  animationPulse,
  pop,
  slideRight,
} from '@erxes/ui/src/utils/animations';
import styled, { keyframes } from 'styled-components';

import { NameCardText } from '@erxes/ui/src/components/nameCard/NameCard';
import colors from '@erxes/ui/src/styles/colors';
import { dimensions } from '@erxes/ui/src/styles';
import styledTS from 'styled-components-ts';

export const Tab = styled(TabTitle)`
  display: flex;
  flex-direction: column;
  font-size: 12px;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;

  > i {
    height: 20px;
  }

  &.active::before {
    border-bottom: none;
  }

  &.active {
    color: #4f33af;
  }
`;

export const TabsContainer = styled(Tabs)`
  height: fit-content;
  border-top: 1px solid ${colors.borderPrimary};
`;

export const TabContent = styledTS<{ show: boolean }>(styled.div)`
  display:${(props) => (props.show ? 'block' : 'none')};
  margin-bottom: ${dimensions.unitSpacing}px;
`;

export const CallHistory = styled.div`
  padding: 10px 20px 20px 20px;
  height: 392px;
  overflow: auto;
  gap: 10px;
  display: flex;
  flex-direction: column;

  h4 {
    margin: 0;
    font-size: 14px;
  }
`;

export const Contacts = styled.div`
  padding: 10px 20px 20px 20px;
  height: 370px;
  overflow: auto;
  gap: 10px;
  display: flex;
  flex-direction: column;

  h4 {
    margin-bottom: 0;
  }
`;

export const CallDetail = styledTS<{ isMissedCall: boolean}>(styled.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  > div {
    display: flex;
    align-items: center;

    > i {
      margin-right: 5px;
      color: #666;
    }

    ${NameCardText} {
      > div {
        color: ${props => props.isMissedCall ? colors.colorCoreRed : colors.colorCoreDarkGray};
      }
    }
  }

  a {
    font-weight: 700;
    color: ${(props) => (props.isMissedCall ? '#FF4949' : '#000')};
  }
`;

export const AdditionalDetail = styled.div`
  color: #888;
  align-items: center;
  display: flex;

  > span {
    font-size: 11px;
    margin-right: 5px;
  }

  .dropdown-menu {
    right: 0;
    left: unset !important;
    padding: 0px;
    transform: translate3d(-7px, 27px, 0px) !important;

    li {
      display: flex;
      gap: 5px;
      cursor: pointer;
      padding: 10px 15px;

      &:hover {
        background: #eee;
      }
    }
  }

  i {
    cursor: pointer;
  }
`;

export const InputBar = styledTS<{ type?: string }>(styled.div)`
  justify-content: center;
  align-items: center;
  display: flex;
  flex: 1;
  padding: 0 5px 0 12px;
  border-radius: 8px;
  height: 41px;
  margin: ${(props) =>
    props.type === 'country' ? '5px 0px 10px 0px' : '10px 20px'};
  border: 1px solid ${colors.borderPrimary};

  input {
    border-bottom: 0;
    margin-left: 10px;
  }
`;

export const ContactItem = styled.div`
  justify-content: space-between;
  align-items: center;
  display: flex;
  width: 100%;
`;

export const NumberInput = styled.div`
  display: flex;
  flex-direction: column;

  button {
    margin: 0 20px;
    flex: 1;
  }

  p {
    margin: 20px 20px 0;
    color: rgba(0, 0, 0, 0.62);
  }

  .Select {
    border: 1px solid ${colors.borderPrimary};
    border-radius: ${dimensions.unitSpacing}px;
    margin: 8px 20px 10px;
    padding: 10px 20px;
    font-size: 15px;
  }

  .Select-control {
    border-bottom: none;
  }
  .Select-menu-outer {
    overflow: auto;
    position: absolute;
    top: auto;
    bottom: 0;
    max-height: 100px;
  }
`;

export const CountryCode = styled.div`
  border-right: 1px solid ${colors.borderPrimary};
  padding-right: ${dimensions.unitSpacing}px;
  margin-right: ${dimensions.unitSpacing}px;
  width: 82px;

  img {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    margin-right: 5px;
  }

  i {
    margin-left: 5px;
  }
`;

export const BackIcon = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 500;
  color: ${colors.colorPrimary};
  > i {
    margin-right: ${dimensions.unitSpacing - 5}px;
  }
`;

export const ChooseCountry = styled.div`
  padding: ${dimensions.coreSpacing}px;
`;

export const Country = styled.div`
  display: flex;
  cursor: pointer;
  margin: ${dimensions.unitSpacing}px 0;
`;

export const Keypad = styled.div`
  gap: 5px;
  display: flex;
  flex-wrap: wrap;
  padding: 0 ${dimensions.coreSpacing}px;

  .number {
    width: 32%;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border: 1.12px solid rgba(0, 0, 0, 0.08);
    border-radius: ${dimensions.unitSpacing}px;
    cursor: pointer;
    transition: all ease 0.3s;

    &:hover {
      background: #f5f5f5;
    }
  }

  .symbols {
    width: 32%;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    cursor: pointer;

    > div {
      cursor: pointer;
    }
  }

  .plus {
    font-size: 30px;
    margin-right: 8px;
  }

  .star {
    margin-right: 8px;
    font-weight: 800;
  }
`;

export const CountryContainer = styled.div`
  height: 315px;
  overflow: auto;
`;

export const IncomingCallNav = styledTS<{ type?: string }>(styled.div)`
  display: flex;
  position: fixed;
  bottom: ${(props) => (props.type === 'outgoing' ? '0' : '150px')};
  right: ${(props) => (props.type === 'outgoing' ? '0' : '20px')};
  z-index: 999;
  animation: ${slideRight} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1;

  button {
    height: 30px;
    margin: auto 0;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.2);
  }
`;

export const CallButton = styledTS<{
  type?: string;
  height?: string;
  width?: string;
  display?: string;
}>(styled.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.type === 'decline' ? '#FF4949' : '#13CE66')};
  border-radius: 50%;
  margin-right: 8px;
  height: 30px;
  width: 30px;
  color: #fff;
  margin-top: auto;
  margin-bottom: auto;
  margin-left: ${(props) => (props.type === 'decline' ? '0' : '0px')};
  animation: ${pulse} 1.5s infinite alternate;
`;

export const InCall = styled.div`
  padding: ${dimensions.coreSpacing}px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

export const CallInfo = styledTS<{ shrink?: boolean }>(styled.div)`
  background: #4F33AF;
  border-radius: ${dimensions.unitSpacing}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: ${(props) => (props.shrink ? '155px' : '375px')};
  color: #fff;
  padding: ${dimensions.coreSpacing}px;
  text-align: center;
  width: 100%;
`;

export const PhoneNumber = styledTS<{ shrink?: boolean }>(styled.div)`
  ${(props) =>
    props.shrink
      ? `font-weight: 700;
    font-size: 15px;`
      : `font-weight: 500;
    font-size: 18px;`}

    > h5 {
      margin: 0;
    }
`;

export const Actions = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
`;

export const CallAction = styledTS<{ isDecline?: boolean; shrink?: boolean }>(
  styled.div,
)`
  width: 60px;
  height: 60px
  border-radius: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  color: ${colors.colorWhite};
  background: rgba(255, 255, 255, 0.4);
  margin-bottom: 5px;
  transition: all ease .3s;

  ${(props) =>
    props.isDecline &&
    `
    background: ${colors.colorCoreRed};
  `}

  &:hover {
    background: ${(props) =>
      props.isDecline ? 'rgba(234, 71, 93, 0.6)' : 'rgba(255, 255, 255, 0.2)'};
  }
`;

export const ActionNumber = styled.div`
  background: #ffc82c;
  width: ${dimensions.coreSpacing}px;
  height: ${dimensions.coreSpacing}px;
  border-radius: 50%;
  margin-left: ${dimensions.unitSpacing}px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const InCallFooter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 40px;
`;

export const CallTab = styled(TabTitle)`
  display: flex;

  &.active::before {
    border-bottom: none;
  }

  &.active {
    background-color: #4f33af;
    color: #fff;
    border-top-left-radius: ${dimensions.unitSpacing}px;
    border-top-right-radius: ${dimensions.unitSpacing}px;
  }
`;

export const CallTabsContainer = styled(Tabs)`
  height: fit-content;
  margin-top: 20px;
  width: 100%;
  border-bottom: none;
`;

export const CallTabContent = styledTS<{ tab: string; show: boolean }>(
  styled.div,
)`
  height: 355px;
  width: 100%;
  border: 1.2px solid #4F33AF;
  display: ${(props) => (props.show ? 'flex' : 'none')};
  border-radius: ${(props) =>
    props.tab === 'Notes'
      ? '0px 10px 10px 10px'
      : props.tab === 'Assign'
        ? '10px 0px 10px 10px'
        : '10px'};
  flex-direction: column;
  
  ul {
    height: 275px;
    max-height: 275px;
  }
  
  textarea {
    border-bottom: none;
    height: 300px !important;
    padding: 10px;
  }

  button {
    margin: 10px;
    flex: 1;
  }
`;

export const WidgetWrapper = styledTS<{ isConnected?: boolean }>(styled.div)`
  cursor: pointer;
  width: 56px;
  height: 56px;
  border-radius: 56px;
  background: ${props => props.isConnected ? colors.colorCoreRed : colors.colorCoreGreen};
  position: relative;
  color: ${colors.colorWhite};
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  transition:
    box-shadow 0.3s ease-in-out,
    background-image 0.3s ease-in;
  animation: ${pop} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:before {
    animation: ${props => !props.isConnected && `${animationPulse} 2s infinite`};
    border-radius: 50%;
    color: inherit;
    content: '';
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }

  span {
    position: absolute;
    top: -4px;
    right: -8px;
    padding: 3px;
    min-width: 18px;
    min-height: 18px;
    line-height: 12px;
  }
`;

export const DisconnectCall = styled.div`
  padding: 10px 20px;
  width: 100%;
  button {
    margin: 0;
    width: 100%;
  }
`;

/* IncomingCall.css */
export const IncomingContainer = styled.div`
  padding: ${dimensions.unitSpacing}px;
  text-align: center;
  min-width: 380px;
  background: ${colors.colorWhite};
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing}px;
  overflow: hidden;
`;

export const IncomingContent = styled.div`
  background: linear-gradient(
    170.05deg,
    #5b38ca 0%,
    #4e31a8 49.66%,
    #1f0f53 98.7%
  );
  padding: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  color: ${colors.colorWhite};
  border-radius: ${dimensions.unitSpacing}px;

  > p {
    margin: ${dimensions.unitSpacing}px 0;
  }
`;

export const IncomingButtonContainer = styled.div`
  margin-top: ${dimensions.coreSpacing}px;
  display: flex;
  justify-content: space-between;
  margin: 20px 80px 0;

  b {
    margin-top: ${dimensions.unitSpacing}px;
  }
`;

export const IncomingActionButton = styledTS<{
  type?: string;
}>(styled.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => (props.type === 'decline' ? '#FF4949' : '#13CE66')};
  border-radius: 60px;
  height: 60px;
  width: 60px;
  transition: background-color 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: ${(props) =>
      props.type === 'accepted' ? '#45a049' : '#d32f2f'};
  }
`;

export const NameCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  > h5 {
    margin: 0 0 ${dimensions.unitSpacing}px;

    > i {
      margin-right: 5px;
      animation: ${pulse} 2s infinite;
    }
  }

  > h4 {
    font-weight: 800;
    word-break: break-word;
  }
`;

export const KeypadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 20px;
  background: #fcfcfd;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

export const HeaderItem = styled.div`
  border: 1px solid ${colors.borderPrimary};
  padding: 5px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  cursor: pointer;
  font-weight: 500;
  transition: all ease 0.3s;

  > i {
    margin-right: 5px;

    &.reload {
      color: #667085;
    }
    &.on {
      color: ${colors.colorCoreGreen};
    }
    &.off {
      color: ${colors.colorCoreRed};
    }
    &.pause {
      color: ${colors.colorCoreSunYellow};
    }
  }

  &:hover {
    background: #f5f5f5;
  }
`;

export const IncomingCalls = styled.div`
  display: flex;
`;

export const ActiveCalls = styled.div`
  background: ${colors.colorWhite};
`;
