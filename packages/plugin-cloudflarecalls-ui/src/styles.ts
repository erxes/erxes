import { TabTitle, Tabs } from '@erxes/ui/src/components/tabs';
import {
  animationPulse,
  pop,
  slideRight,
} from '@erxes/ui/src/utils/animations';
import { dimensions, typography } from '@erxes/ui/src/styles';
import styled, { css, keyframes } from 'styled-components';

import { WhiteBox } from '@erxes/ui/src/layout/styles';
import colors from '@erxes/ui/src/styles/colors';
import styledTS from 'styled-components-ts';
import { rgba } from '@erxes/ui/src/styles/ecolor';

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
  border-radius: 0 0 25px 10px;
  overflow: hidden;
  background: red;
`;

export const TabsWrapper = styled.div`
  border-top: 1px solid ${colors.borderPrimary};
  margin-bottom: ${dimensions.unitSpacing}px;

  > div {
    border-bottom: none;
  }
`;

export const TabContent = styledTS<{ show?: boolean }>(styled.div)`
  padding-bottom: ${dimensions.unitSpacing}px;
  border-radius: 10px 10px 0 0;
`;

export const CallHistory = styled.div`
  height: 392px;
  overflow: auto;

  h4 {
    margin: 10px 20px;
    font-size: 16px;
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

export const PhoneNumber = styledTS<{ $shrink?: boolean }>(styled.div)`
  ${(props) =>
    props.$shrink
      ? `font-weight: 600;
    font-size: 15px;`
      : `font-weight: 500;
    font-size: 18px;`}

    > h5 {
      margin: 0;
    }

    > span {
      display: block;
      color: ${colors.bgGray};
      font-size: 13px;
      margin-top: -5px;
      margin-bottom: ${dimensions.unitSpacing}px;
      font-style: italic;
    }
`;

export const CallDetail = styledTS<{
  $isMissedCall: boolean;
  $isIncoming: boolean;
}>(styled.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 20px;
  padding-left: ${(props) => props.$isIncoming && '40px'};
  cursor: pointer;
  transition: all ease .3s;

  &:hover, &.active {
    background: ${colors.bgActive};
  }

  > div {
    display: flex;
    align-items: center;

    > i {
      margin-right: 8px;
      color: #666;
    }

    ${PhoneNumber} {
        color: ${(props) =>
          props.$isMissedCall ? colors.colorCoreRed : colors.colorCoreDarkGray};
    }
  }

  a {
    font-weight: 700;
    color: ${(props) => (props.$isMissedCall ? '#FF4949' : '#000')};
  }
`;

export const AdditionalDetail = styled.div`
  color: #888;
  align-items: center;
  display: flex;
  position: relative;

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

export const InputBar = styledTS<{ type?: string; $transparent?: boolean }>(
  styled.div,
)`
  justify-content: center;
  align-items: center;
  display: flex;
  flex: 1;
  padding: 0 5px 0 12px;
  border-radius: 8px;
  height: 41px;
  margin: ${(props) =>
    props.type === 'country' ? '5px 0px 10px 0px' : '10px 20px'};
  border: 1px solid ${(props) => (props.$transparent ? 'rgba(255,255,255, 0.2)' : colors.borderPrimary)};

  input {
    border: 0;
    width: 100%;
    color: ${(props) => (props.$transparent ? colors.colorWhite : colors.textPrimary)};
    padding: ${dimensions.unitSpacing}px 0;
    background: ${(props) => props.$transparent && 'none'};
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${colors.colorSecondary};
    }
  
    ::placeholder {
      color: ${(props) => (props.$transparent ? '#cecece' : '#aaa')};
    }
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

  .css-b62m3t-container {
    border: 1px solid ${colors.borderPrimary};
    border-radius: ${dimensions.unitSpacing}px;
    margin: 8px 20px 10px;
    padding: 5px 10px;
    font-size: 15px;
  }

  .css-13cymwt-control,
  .css-t3ipsp-control {
    min-height: unset;
    border-bottom: none;
  }
  .css-14h4o58-menu {
    overflow: auto;
    width: calc(100% - 20px);
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

export const KeyPadFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
  position: relative;

  > span {
    position: absolute;
    right: 0;
    top: 20px;
    cursor: pointer;
  }
`;

export const Keypad = styledTS<{ $transparent?: boolean }>(styled.div)`
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
    border: 1.12px solid ${(props) => (props.$transparent ? 'rgba(255,255,255, 0.2)' : 'rgba(0, 0, 0, 0.08)')};
    border-radius: ${dimensions.unitSpacing}px;
    cursor: pointer;
    transition: all ease 0.3s;

    &:hover {
      background: ${(props) => (props.$transparent ? 'rgba(0,0,0,.12)' : '#f5f5f5')};
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
  animation: ${css`
    ${slideRight}
  `} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1;

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
  animation: ${css`
    ${pulse}
  `} 1.5s infinite alternate;
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

export const Actions = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  flex-direction: column;
  gap: 10px;

  > div {
    .coming-soon {
      margin-bottom: -10px;
      margin-top: -3px;
      font-size: 10px;
      color: #ddd;
    }
  }
`;

export const InnerActions = styled.div`
  display: flex;
  gap: 25px;
`;

export const CallAction = styledTS<{
  $isDecline?: boolean;
  $active?: boolean;
  $disabled?: boolean;
}>(styled.div)`
  width: 60px;
  height: 60px;
  border-radius: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: ${(props) => (props.$disabled ? 'not-allowed' : 'pointer')};
  color: ${(props) => (props.$active ? colors.textPrimary : colors.colorWhite)};
  background: ${(props) =>
    props.$disabled
      ? colors.colorShadowGray
      : props.$isDecline
        ? colors.colorCoreRed
        : props.$active
          ? colors.colorWhite
          : 'rgba(255, 255, 255, 0.4)'};
  margin-bottom: 2px;
  transition: all ease .3s;

  ${(props) =>
    props.$isDecline &&
    `
    justify-self: center;
    grid-column-start: span 3;
  `}

  &:hover {
    background: ${(props) =>
      props.$isDecline
        ? 'rgba(234, 71, 93, 0.6)'
        : !props.$active && !props.$disabled && 'rgba(255, 255, 255, 0.2)'};
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

export const WidgetWrapper = styledTS<{ $isConnected?: boolean }>(styled.div)`
  cursor: pointer;
  width: 56px;
  height: 56px;
  border-radius: 56px;
  background: ${(props) =>
    props.$isConnected ? colors.colorCoreBlue : colors.colorCoreYellow};
  position: relative;
  color: ${colors.colorWhite};
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
  transition:
    box-shadow 0.3s ease-in-out,
    background-image 0.3s ease-in;
  animation: ${css`
    ${pop}
  `} 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 1;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  &:before {
    animation: ${(props) =>
      !props.$isConnected &&
      css`
        ${animationPulse} 2s infinite
      `};
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
  min-width: 375px;

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
      animation: ${css`
          ${pulse}`} 2s infinite;
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
  border-radius: 10px 10px 0 0;
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

export const FlexWrap = styledTS(styled.div)`
  display: flex;
  flex-wrap: wrap;
  padding: '20px 20px 20px 20px';

  > a,
  > div {
    flex-basis: 240px;
    display: flex;
    flex-shrink: 0;

    @media (min-width: 480px) {
      flex-basis: 33.3333333%;
    }

    @media (min-width: 768px) {
      flex-basis: 25%;
    }

    @media (min-width: 1170px) {
      flex-basis: 20%;
    }

    @media (min-width: 1400px) {
      flex-basis: 25%;
    }
  }
`;

export const SwitchboardBox = styledTS<{ nowrap?: boolean }>(styled.div)`
padding: 20px 20px;
  flex-basis: 250px;
  display: flex;
  flex-direction: column;
  position: relative;
  flex: ${(props) => !props.nowrap && 1};
  min-height: 200px;
  transition: all ease 0.3s;

  h5 {
    margin: ${dimensions.unitSpacing}px 0 15px;
    font-size: 18px;
    font-weight: bold;
    text-transform: capitalize;
  }

  &:hover {
    box-shadow: 0px 16px 24px rgb(0 0 0 / 6%), 0px 2px 6px rgb(0 0 0 / 4%),
      0px 0px 1px rgb(0 0 0 / 4%);
  }
`;

export const PreviewContent = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  padding: ${dimensions.headerSpacing}px;
  transition: all ease 0.3s;

  > button {
    margin: 0 0 ${dimensions.unitSpacing}px 0 !important;
    min-width: 140px;
  }
`;

export const SwitchboardPreview = styled.div`
  width: 100%;
  height: 100%;
  border-radius: ${dimensions.unitSpacing - 2}px ${dimensions.unitSpacing - 2}px
    ${dimensions.unitSpacing - 2}px ${dimensions.unitSpacing - 2}px;
  border: 1px solid ${colors.borderPrimary};
  background: #fefefe;
  overflow: hidden;
  position: relative;
`;

export const Container = styled.div`
  position: relative;
  margin: 0 auto;
  width: fit-content;
`;

export const SwitchboardRate = styledTS<{ color?: string }>(styled.div)`
  color: ${(props) => props.color};
  font-size: 24px;
  position: absolute;
  align-items: center;
  justify-content: center;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  margin-top: 25%;
`;
const iconWrapperWidth = 80;

const ActivityRow = styledTS<{ isConversation?: boolean }>(styled(WhiteBox))`
  padding: ${(props) => (props.isConversation ? '0' : dimensions.coreSpacing)}px;
  background: ${(props) => props.isConversation && colors.bgLight};
  position: relative;
  overflow: visible;
  margin-bottom: ${dimensions.coreSpacing}px;
  border-radius: 5px;
  height: auto;
  transition:height 0.3s ease-out;

  &:last-of-type {
    margin-bottom: 0;
  }

  &:hover {
    background: ${(props) => props.isConversation && colors.bgLightPurple};
  }
`;

const ActivityIcon = styledTS<{ color?: string }>(styled.span)`
  display: inline-block;
  position: absolute;
  background-color: ${(props) => props.color};
  height: ${iconWrapperWidth * 0.4}px;
  width: ${iconWrapperWidth * 0.4}px;
  line-height: ${iconWrapperWidth * 0.4}px;
  text-align: center;
  border-radius: 50%;
  left: ${-iconWrapperWidth + iconWrapperWidth * 0.3}px;
  top: ${dimensions.coreSpacing}px;
  z-index: 2;

  & i {
    margin: 0;
    color: ${colors.colorWhite};
  }
`;

const ActivityDate = styled.div`
  color: ${colors.colorCoreGray};
  font-weight: ${typography.fontWeightLight};
  font-size: 11px;
  flex-shrink: 0;
  margin-left: ${dimensions.unitSpacing}px;
`;

const AcitivityHeader = styled.div`
  display: flex;
  justify-content: space-between;
`;

const TransferCallWrapper = styled.div`
  margin: 20px 20px 0px 20px;
  padding-bottom: 20px;
`;

const DialogWrapper = styledTS<{ direction?: string }>(styled.div)`
  position: fixed;
  inset: 0;
  overflow-y: auto;
  z-index: 1000000;
  left: auto;
  margin-right: ${(props) => (props.direction === 'incoming' ? '30px' : '25px')};
  width: 360px;
  margin-top: 120px;
`;

const CallWrapper = styled.div`
  position: absolute;
  width: 72px;
  z-index: 999999;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  bottom: 200px;
  right: 12px;
`;
const MessageContent = styledTS<{ $internal?: boolean; $staff?: boolean }>(
  styled.div,
)`
  margin-top: 5px;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  border-radius: 20px;
  background: ${colors.colorWhite};
  background: ${(props) =>
    props.$internal
      ? colors.bgInternal
      : props.$staff && colors.colorSecondary};
  word-break: break-word;
  box-shadow: 0 1px 1px 0 ${colors.darkShadow};
  color: ${(props) => props.$staff && !props.$internal && colors.colorWhite};
  text-align: left;

  a {
    color: ${(props) =>
      props.$staff && !props.$internal
        ? colors.colorWhite
        : colors.linkPrimary};
    text-decoration: underline;
  }

  p {
    margin: 0;
  }

  > span {
    display: block;
  }

  .mention {
    font-weight: bold;
    display: inline-block;
  }

  img {
    max-width: 300px;
    border-radius: 2px;
  }

  ul,
  ol {
    padding-left: 25px;
    margin: 0;
  }

  h3 {
    margin-top: 0;
  }

  blockquote {
    margin-bottom: 0;
    border-color: ${colors.borderDarker};
  }

  pre {
    margin-bottom: 0;
  }
`;

const OperatorFormView = styled.div`
  position: relative;
  background: ${colors.bgActive};
  padding: 5px ${dimensions.unitSpacing}px;
  margin-bottom: ${dimensions.unitSpacing}px;
  border-radius: 4px;
`;

const OperatorRemoveBtn = styled.div`
  position: absolute;
  right: -10px;
  top: -10px;
  > button {
    padding: 3px 5px;
  }
`;

const KeyPadContainer = styled.div`
  position: relative;
`;

const DashboardTable = styledTS<{ color: string }>(styled.div)`
  border: 1px solid #eee;
  border-radius: ${dimensions.unitSpacing - 2}px ${dimensions.unitSpacing - 2}px;
  height: 400px;
  overflow-y: auto;
  background: ${(props) => props.color} !important;
`;
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 50% auto;
  grid-gap: 10px;
  padding: 0 5px 0 5px;
`;

const GridItem = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  text-align: center;
`;

const Item3 = styled(GridItem)`
  grid-row: 1 / span 2;
`;

const Header = styled.h3`
  text-align: left;
  margin: 0 0 10px 0;
`;

const Label = styledTS<{ $color: string }>(styled.span)`
  border-radius: 5px;
  padding: 3px 9px;
  white-space: nowrap;
  display: inline-block;
  line-height: 1.32857143;
  background: ${(props) => rgba(props.$color, 0.15)};
  color: ${(props) => props.$color};
  border: none;
  
  margin-left: 20%;
  &:hover {
    cursor: default;
  }

  &.round {
    width: 15px;
    height: 15px;
    padding: 3px;
    line-height: 0.5;
    text-align: center;
    font-weight: normal;
  }
  
  @media (max-width: 768px) {
    font-size: 10px;
    line-height: 1.4;
  }

  @media (max-width: 1024px) {
    font-size: 11px;
  }

  @media (min-width: 1024px) {
    font-size: 12px;
  }

  @media (min-width: 1280px) {
    font-size: 13px;
  }

  @media (min-width: 2000px) {
    font-weight: 600;
    font-size: 15px;
  }
`;

const Th = styledTS<{ backgroundColor: string; color?: string }>(styled.th)`
  background: ${(props) => props.backgroundColor} !important;
  color: ${(props) => props.color && props.color} !important;
`;

const Td = styledTS<{ color?: string; fontWeight?: string }>(styled.td)`
  color: ${(props) => props.color && props.color} !important;

  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 1.4;
  }

  @media (max-width: 1024px) {
    font-size: 13px;
  }

  @media (min-width: 1024px) {
    font-size: 14px;
  }

  @media (min-width: 1280px) {
    font-size: 15px;
  }

  @media (min-width: 2000px) {
    font-size: 20px;
    font-weight: ${(props) => props.fontWeight && props.fontWeight} !important;
  }
`;

export {
  ActivityRow,
  ActivityIcon,
  ActivityDate,
  AcitivityHeader,
  TransferCallWrapper,
  CallWrapper,
  DialogWrapper,
  MessageContent,
  OperatorFormView,
  OperatorRemoveBtn,
  KeyPadContainer,
  DashboardTable,
  GridContainer,
  GridItem,
  Item3,
  Header,
  Label,
  Th,
  Td,
};
