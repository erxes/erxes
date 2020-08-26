import { colors, dimensions, typography } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { LogoContainer } from 'modules/settings/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;
const messageBg = '#eaebed';

const ErxesTopbar = styled.div`
  background-image: url(https://s3.amazonaws.com/erxes/pattern.png);
  background-size: cover;
  box-shadow: 0 4px 6px 0 ${rgba(colors.colorBlack, 0.1)};
  min-height: 70px;
  display: inline-table;
  color: ${colors.colorWhite};
`;

const TopBarIcon = styledTS<{ isLeft: boolean }>(styled.div)`
  transition: background 0.3s ease-in-out;
  border-radius: ${unitSpace};
  cursor: pointer;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  position: absolute;
  top: 15px;
  left: ${props => props.isLeft && '15px'};
  right: ${props => (props.isLeft ? '0px' : '15px')};

  &:hover {
    background-color: ${rgba(colors.colorBlack, 0.2)};
  }
`;

const ErxesMiddleTitle = styled.div`
  padding: 20px 60px ${coreSpace} 65px;

  h3 {
    font-size: ${coreSpace};
    font-weight: bold;
    margin: 0 0 ${unitSpace};
    padding-right: ${dimensions.headerSpacing}px;
    line-height: 1.5;
  }

  span {
    opacity: 0.8;
    font-size: 13px;
  }
`;

const ErxesStaffProfile = styled.div`
  position: relative;
  width: 33%;
`;

const StateSpan = styledTS<{ state: boolean }>(styled.span)`
  border-radius: ${unitSpace};
  height: 8px;
  width: 8px;
  bottom: 2px;
  position: absolute;
  right: 56%;
  background-color: ${props =>
    props.state ? colors.colorCoreGreen : colors.colorLightGray};
`;

const ErxesSupporters = styled.div`
  padding-top: ${unitSpace};
  display: flex;

  img {
    border-radius: 22px;
    height: 40px;
    width: 40px;
  }
`;

const Supporters = styled(ErxesSupporters)`
  ${ErxesStaffProfile} {
    margin-right: ${dimensions.unitSpacing}px;
    width: auto;
  }

  ${StateSpan} {
    display: none;
  }
`;

const ErxesState = styled.div`
  font-size: ${typography.fontSizeUppercase}px;
  font-weight: ${typography.fontWeightLight};
  margin-left: 43px;
`;

const ErxesSpacialMessage = styled.li`
  background-color: ${messageBg};
  border-radius: ${unitSpace};
  box-shadow: 0 1px 1px 0 ${rgba(colors.colorBlack, 0.2)};
  color: ${colors.textSecondary};
  margin-bottom: ${coreSpace};
  padding: ${coreSpace};
`;

const ErxesAvatar = styled.div`
  border-radius: 50%;
  bottom: ${coreSpace};
  width: 40px;
  height: 40px;
  left: 0;
  overflow: hidden;
  position: absolute;

  img {
    width: 100%;
    height: 100%;
  }
`;

const ErxesMessagesList = styled.ul`
  background-color: #faf9fb;
  overflow: auto;
  padding: ${coreSpace};
  margin: 0;
  flex: 1;
  list-style: none;

  &.background-1 {
    background-image: url('/images/patterns/bg-1.png');
  }
  &.background-2 {
    background-image: url('/images/patterns/bg-2.png');
  }
  &.background-3 {
    background-image: url('/images/patterns/bg-3.png');
  }
  &.background-4 {
    background-image: url('/images/patterns/bg-4.png');
  }

  li {
    position: relative;
    margin-bottom: ${unitSpace};
  }
`;

const ErxesMessage = styled.div`
  background-color: ${messageBg};
  border-radius: ${coreSpace};
  border-bottom-left-radius: 2px;
  box-shadow: 0 1px 1px 0 ${rgba(colors.colorBlack, 0.2)};
  color: #686868;
  display: inline-block;
  margin: 0 ${coreSpace} 5px 50px;
  padding: 12px ${coreSpace};
`;

const ErxesDate = styled.div`
  font-size: ${unitSpace};
  color: ${colors.colorCoreGray};
  margin-left: ${dimensions.headerSpacing}px;
`;

const ErxesMessageSender = styled.div`
  overflow: hidden;
  font-size: 14px;
  padding: ${coreSpace} 25px;
  color: ${colors.colorCoreGray};
  border-top: 1px solid ${colors.colorWhite};
  box-shadow: 0 0 15px 0 ${rgba(colors.colorBlack, 0.1)};
  z-index: 3;
`;

const ErxesGreeting = styled.div`
  padding: 25px 40px 45px;
  text-align: left;
  min-height: 174px;
`;

const ErxesFromCustomer = styled.li`
  text-align: right;
`;

const FromCustomer = styled(ErxesMessage)`
  border-bottom-left-radius: ${coreSpace};
  border-top-right-radius: 2px;
  color: ${colors.colorWhite};
  margin: 0 0 5px ${coreSpace};
  text-align: right;
`;

const WidgetPreviewStyled = styled.div`
  background: ${colors.colorWhite};
  color: ${colors.colorWhite};
  border-radius: ${dimensions.unitSpacing}px;
  border-bottom-right-radius: 25px;
  bottom: 80px;
  box-shadow: 0 2px 16px 1px ${rgba(colors.colorBlack, 0.2)};
  display: flex;
  flex-direction: column;
  height: calc(100% - 95px);
  max-height: 660px;
  overflow: hidden;
  position: absolute;
  right: 8px;
  width: 380px;
  z-index: 1;
`;

const Links = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${unitSpace};

  span {
    opacity: 0.7;
    font-size: 11px;
  }
`;

const Launcher = styled(LogoContainer)`
  position: absolute;
  right: ${unitSpace};
  bottom: ${unitSpace};
`;

const Socials = styled.div`
  margin-right: ${dimensions.coreSpacing}px;

  a {
    margin-right: 12px;
    opacity: 0.6;
    transition: all ease 0.3s;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }

  i {
    color: ${colors.colorWhite};
    line-height: 18px;
  }
`;

const GreetingInfo = styled.div`
  h3 {
    font-size: ${coreSpace};
    font-weight: bold;
    margin: 0 0 ${unitSpace};
    padding: 5px 30px 5px 0;
    padding-right: 30px;
    line-height: 1.3;
  }

  p {
    opacity: 0.8;
    font-size: 13px;
    margin: 0;
  }
`;

const ErxesContent = styled.div`
  height: 100%;
  margin-top: -40px;
  flex: 1;
  overflow: auto;
`;

const LeftSide = styled.div`
  float: left;
  height: 42px;
  margin: ${coreSpace} 15px ${coreSpace} ${coreSpace};
  text-align: center;
  width: 40px;

  span {
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${rgba(colors.colorBlack, 0.04)};
    border: 1px solid ${colors.colorShadowGray};
    border-radius: ${coreSpace};
    height: 42px;
    width: 42px;
  }

  i {
    color: ${colors.colorCoreGray};
  }
`;

const RightSide = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  padding: ${coreSpace} ${coreSpace} ${coreSpace} 0;
  margin-left: 75px;
  font-size: 14px;

  p {
    color: ${colors.colorCoreGray};
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > div {
    color: ${colors.colorCoreGray};
    float: right;
    font-size: 12px;
    margin-top: 2px;
  }
`;

const ContentBox = styled.div`
  background: ${colors.colorWhite};
  border-radius: ${dimensions.unitSpacing}px;
  box-shadow: 0 4px 15px 0 ${rgba(colors.colorBlack, 0.1)},
    0 1px 2px 0 ${rgba(colors.colorBlack, 0.1)};
  margin: 15px;
  min-height: 100px;
  padding-top: 15px;
  color: ${colors.colorBlack};

  h4 {
    font-weight: 500;
    margin: 0 ${coreSpace} 15px;
    font-size: 14px;
  }

  ul {
    margin: 0;
    padding: 0;

    li {
      overflow: hidden;
    }
  }
`;

export {
  ErxesTopbar,
  ErxesState,
  ErxesSupporters,
  ErxesMessage,
  ErxesMiddleTitle,
  ErxesSpacialMessage,
  ErxesAvatar,
  ErxesDate,
  ErxesMessageSender,
  ErxesFromCustomer,
  ErxesMessagesList,
  ErxesGreeting,
  Supporters,
  FromCustomer,
  StateSpan,
  ErxesStaffProfile,
  ErxesContent,
  WidgetPreviewStyled,
  GreetingInfo,
  LeftSide,
  RightSide,
  ContentBox,
  Launcher,
  Links,
  Socials,
  TopBarIcon
};
