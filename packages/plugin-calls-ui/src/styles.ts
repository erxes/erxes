import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import colors from '@erxes/ui/src/styles/colors';
import { dimensions } from '@erxes/ui/src/styles';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';

export const Tab = styled(TabTitle)`
  display: flex;
  flex-direction: column;

  &.active::before {
    border-bottom: none;
  }

  &.active {
    color: #4f33af;
  }
`;

export const TabsContainer = styled(Tabs)`
  height: fit-content;
`;

export const TabContent = styledTS<{ show: boolean }>(styled.div)`
  display:${props => (props.show ? 'block' : 'none')};
`;

export const CallHistory = styled.div`
  padding: 10px 20px 20px 20px;
  height: 392px;
  overflow: auto;
  gap: 10px;
  display: flex;
  flex-direction: column;

  h4 {
    margin-bottom: 0;
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

export const CallDetail = styledTS<{ isMissedCall: boolean }>(styled.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    border: 1.2px solid ${props => (props.isMissedCall ? '#FF4949' : '#000')};
  }

  a {
    font-weight: 700;
    color: ${props => (props.isMissedCall ? '#FF4949' : '#000')};
  }
`;

export const AdditionalDetail = styled.div`
  color: #aaa;
  align-items: center;
  display: flex;

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
  margin: ${props =>
    props.type === 'country' ? '5px 0px 10px 0px' : '20px 20px 10px 20px'};
  border: 1.2px solid rgba(0, 0, 0, 0.12);

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
    border: 1.2px solid rgba(0, 0, 0, 0.12);
    border-radius: ${dimensions.unitSpacing}px;
    margin: ${dimensions.coreSpacing}px;
    padding: 10px 20px;
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
  border-right: 1px solid rgba(0, 0, 0, 0.12);
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
  padding: 10px ${dimensions.coreSpacing}px 0;

  .number {
    width: 32%;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.12px solid rgba(0, 0, 0, 0.08);
    border-radius: ${dimensions.unitSpacing}px;
  }

  .symbols {
    width: 32%;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 25px;
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

export const IncomingCallNav = styled.div`
  display: flex;

  button {
    height: 30px;
    margin: auto 0;
  }
`;

export const CallButton = styledTS<{ type?: string }>(styled.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.type === 'decline' ? '#FF4949' : '#13CE66')};
  border-radius: 4px;
  margin-right: 8px;
  height: 30px;
  width: 30px;
  color: #fff;
  margin-top: auto;
  margin-bottom: auto;
  margin-left: ${props => (props.type === 'decline' ? '0' : '8px')};
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
  height: ${props => (props.shrink ? '155px' : '375px')};
  color: #fff;
  padding: ${dimensions.coreSpacing}px;
  text-align: center;
  width: 100%;
`;

export const PhoneNumber = styledTS<{ shrink?: boolean }>(styled.div)`
  ${props =>
    props.shrink
      ? `font-weight: 700;
    font-size: 15px;`
      : `font-weight: 500;
    font-size: 18px;`}
`;

export const Actions = styled.div`
  display: flex;
  gap: 20px;
`;

export const CallAction = styledTS<{ isDecline?: boolean; shrink?: boolean }>(
  styled.div
)`
  width: ${props => (props.shrink ? '38px' : '70px')};
  height: ${props => (props.shrink ? '38px' : '70px')};
  border-radius: 50%;
  border: 1.2px solid rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  cursor: pointer;
  color: #fff;

  ${props =>
    props.isDecline &&
    `
    border-color: #FF4949;
    background: #FF4949;
  `}

  &:hover {
    color: rgba(0, 0, 0, 0.62);
    background: #fff;
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
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
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
  styled.div
)`
  height: 355px;
  width: 100%;
  border: 1.2px solid #4F33AF;
  display: ${props => (props.show ? 'flex' : 'none')};
  border-radius: ${props =>
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
