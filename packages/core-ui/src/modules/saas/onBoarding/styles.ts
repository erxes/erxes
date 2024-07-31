import { colors, dimensions } from '@erxes/ui/src/styles';

import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;

const MainContent = styledTS<{ flexStart?: boolean; full?: boolean }>(
  styled.div,
)`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 24px;
  margin: ${unitSpace};
  background: linear-gradient(119.44deg, #8D94FF 2.96%, #6335FF 51.52%, #8B73BD 100.08%);
  justify-content: ${(props) => (props.flexStart ? 'start' : 'center')};
  padding: ${(props) => (props.full ? '0' : `${dimensions.headerSpacing}px`)};
`;

const Content = styled.div`
  background: ${colors.colorWhite};
  color: #444;
  display: grid;
  grid-template-columns: repeat(2,minmax(0,1fr));
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const RightSidebarContent = styled.div`
  padding: 0 80px;

  .image-wrapper {
    height: 350px;
    width: 100%;
    border-radius: 5px;
    margin-bottom: 40px;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  }

  p {
    line-height: 26px;
    font-size: 14px;
    color: rgba(25, 27, 31, 0.6);
  }
`;

const CarouselWrapper = styled.div`
  width: 80%;
  height: 100%;

  .carousel-caption {
    position: relative;
    color: #fff;
    left: 0;
    right: 0;
    bottom: 0;
    text-align: center;

    p {
      font-size: 14px;
      color: #fff;
    }
  }

  .carousel-item {
    position: relative;
    display: none;
    float: left;
    width: 100%;
    margin-right: -100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    transition: -webkit-transform 0.6s ease-in-out;
    transition: transform 0.6s ease-in-out;
    transition:
      transform 0.6s ease-in-out,
      -webkit-transform 0.6s ease-in-out;

    &.active {
      display: block;
    }

    .image-wrapper {
      height: 300px;
      width: 100%;

      img {
        object-fit: cover;
        width: 100%;
        height: 100%;
      }
    }
  }

  .carousel-indicators {
    display: flex;
    left: 65%;
    gap: 5px;

    span {
      background-color: ${colors.colorPrimary};
      width: 40px;
      height: 4px;
      border-radius: 7px;
      opacity: 0.3;
      border: none;
      cursor: pointer;

      &.active {
        opacity: 1 !important;
      }
    }
  }

  .carousel-control-next,
  .carousel-control-prev {
    top: 30%;
    align-items: flex-start;
  }

  .carousel-control-next-icon,
  .carousel-control-prev-icon {
    filter: invert(1);
  }

  .carousel-control-prev {
    left: -100px;
  }
  .carousel-control-next {
    right: -100px;
  }
`;

const SuccessContent = styled.div`
  img {
    width: 100%;
  }
`;

const LeftSidebar = styledTS<{ showStar?: boolean }>(styled.div)`
  position: relative;
  width: 100%;
  flex-shrink: 0;
  overflow: hidden;
  padding: ${dimensions.headerSpacing}px;
  transition: all ease .3s;

  &:before {
    content: ${(props) => props.showStar && ' '};
    background-image: url(/static/images/home/home3.png); 
    background-repeat: no-repeat;
    position: absolute;
    background-position: right;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    transform: scaleX(-1);
  }

  > .shooting-star {
    position: absolute;
    left: 0;
    right: 0;
    top: 200px;
    transform: scaleX(-1);
  }

  > .welcome-cover {
    position: absolute;
    left: -20px;
    right: 0;
    bottom: 100px;
    transform: scaleX(-1);
  }

  button {
    height: 40px;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;

  h2 {
    font-weight: 400;
    margin: 0 0 10px;
  }

  .header {
    height: 110px;
  }

  p {
    color: #888;
  }
`;

const WelcomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  position: relative;

  .logo {
    width: 130px;
    min-height: 65px;
  }

  h1 {
    color: rgba(0, 0, 0, 0.7);
    background: #fff;
    font-size: 36px;

    @media (min-width: 1500px) {
      font-size: 42px;
    }
  }
`;

const ProgressBar = styled.svg`
  display: block;
  flex-shrink: 0;
`;

const CircleBackground = styledTS<{ activeStep?: number }>(styled.circle)`
  fill: none;
  stroke: #d6d6d6;
`;

const Circle = styledTS<{ activeStep?: number; totalStep?: number }>(
  styled.circle,
)`
  fill: none;
  stroke: ${(props) =>
    props.activeStep === props.totalStep
      ? colors.colorCoreGreen
      : colors.colorPrimary};
  transition: stroke-dashoffset 0.3s ease-in-out;
`;

const IndicatorText = styled.text`
  fill: #000;
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: ${dimensions.coreSpacing}px;
`;

const GeneralInformationWrapper = styled.div`
  background-color: #f5f5f5;
  padding: 16px;
  height: 100%;
`;

const GeneralInformationForm = styled.div`
  height: auto;
  margin-top: 75px;
  background-color: ${colors.colorWhite};
  padding: 16px;
  border-radius: 8px;

  > p {
    color: rgba(25, 27, 31, 0.4);
    font-size: 14px;
    line-height: 18px;
  }

  label {
    color: ${colors.colorBlack};
    font-size: 14px;
    margin-bottom: 20px;
    display: inline;
    text-transform: none;
    font-weight: 400;
  }

  input {
    background: #f5f5f5;
    height: 50px;
    font-size: 14px;
    margin-top: 20px;
    border-radius: 8px;
    border: none;
    padding: ${dimensions.coreSpacing}px;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075);

    &:focus {
      outline: 0;
      box-shadow: none;
    }
  }
`;

const SidebarContent = styledTS<{ isCenter?: boolean }>(styled.div)`
  height: calc(100% - 200px);
  margin-top: ${dimensions.coreSpacing + dimensions.coreSpacing}px;
  overflow-y: auto;

    ${(props) =>
      props.isCenter &&
      `
      display: flex;
      align-items: center;
      justify-content: center;
      `};

  > p {
    color: rgba(25, 27, 31, 0.4);
    font-size: 14px;
    line-height: 18px;
  }

  .color-accent {
    height: 135px !important;

    input {
      padding: 1px 0 1px 8px;
    }

    label {
      font-size: 12px;
      font-weight: 600;
      color: ${colors.colorPrimary};
      }
  }

  .form-group {
    background-color: ${colors.colorWhite};
    position: relative;
    height: 52px;
    transition: all ease 0.3s;
    margin-bottom: 24px;
    border-radius: 8px;

    input {
      border-radius: 8px;
      border: none;
    }

    &.active {
      border: 1px solid ${colors.colorPrimary};

      label {
        transform: translateY(3px) scale(0.8);
        transform-origin: 0 0;
        font-weight: 600;
        color: ${colors.colorPrimary};
      }

      input {
        &:focus {
          border-color: inherit;
        }
      }
    }

    &.disabled {
      background: ${rgba(colors.colorPrimary, 0.1)};
      border-color: ${rgba(colors.colorPrimary, 0.1)};

      input {
        background: ${rgba(colors.colorPrimary, 0.1)};
      }
    }
  }

  label {
    position: absolute;
    color: #9e9e9e;
    transform-origin: 0% 100%;
    text-align: initial;
    transform: translateY(15px);
    font-size: 14px;
    width: 100%;
    margin: 0;
    padding: 0 ${dimensions.coreSpacing}px;
    transition: transform 0.2s ease-out, color 0.2s ease-out,
      -webkit-transform 0.2s ease-out;
  }

  input {
    position: relative;
    box-shadow: inset 0 1px 1px rgba(0,0,0,.075);
    z-index: 5;
    transition: all ease 0.3s;
    height: 50px;
    font-size: 14px;
    padding: ${dimensions.coreSpacing}px 20px ${dimensions.unitSpacing}px;

    &:focus {
      outline: 0;
      box-shadow: none;
    }
  }
`;

const ColorChooserWrapper = styled.div`
  .twitter-picker {
    box-shadow: none !important;
    padding: 16px;
    width: 65% !important;
    background: none !important;

    > div:nth-child(3) {
      padding: 25px 0px 0px 0px !important;

      input {
        width: 40% !important;
      }
    }
  }
`;

const WidgetPreviewStyled = styled.div`
  background: #f5f5f5;
  color: ${colors.colorWhite};
  border-radius: ${dimensions.unitSpacing}px;
  border: 1px solid #f5f5f5;
  bottom: 80px;
  display: flex;
  flex-direction: column;
  max-height: 940px;
  overflow: hidden;
  padding-bottom: 20px;
  width: 420px;
  z-index: 1;
`;

const ErxesGreeting = styled.div`
  padding: 25px 40px 45px;
  text-align: left;
  min-height: 174px;
  position: relative;
`;

const ErxesTopbar = styled.div`
  background-image: url(https://s3.amazonaws.com/erxes/pattern.png);
  background-size: cover;
  box-shadow: 0 4px 6px 0 ${rgba(colors.colorBlack, 0.1)};
  min-height: 70px;
  display: inline-table;
  color: ${colors.colorWhite};
`;

const ErxesMiddleTitle = styled.div`
  padding: 20px 60px ${coreSpace} 20px;

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

const Links = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${unitSpace};

  span {
    opacity: 0.7;
    font-size: 11px;
  }
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
  left: ${(props) => props.isLeft && '15px'};
  right: ${(props) => (props.isLeft ? '0px' : '15px')};

  &:hover {
    background-color: ${rgba(colors.colorBlack, 0.2)};
  }
`;

const TopBarTab = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  color: ${colors.textPrimary};
  cursor: pointer;
  display: flex;
  height: 36px;
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;

  > span {
    align-items: center;
    background: ${colors.colorWhite};
    display: flex;
    flex: 1;
    font-size: 11px;
    justify-content: center;
    text-align: center;
    text-transform: uppercase;
    transition: all 0.3s ease;

    &:last-of-type {
      border-left: 1px solid ${colors.borderPrimary};
    }
  }
`;

const ContentBox = styled.div`
  background: ${colors.colorWhite};
  border-radius: ${dimensions.unitSpacing}px;
  box-shadow:
    0 4px 15px 0 ${rgba(colors.colorBlack, 0.1)},
    0 1px 2px 0 ${rgba(colors.colorBlack, 0.1)};
  margin: 32px 15px 15px 15px;
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

  .form-group {
    padding: 0 15px 15px 15px;

    input {
      background: #f5f5f5;
      height: 50px;
      font-size: 14px;
      padding: ${dimensions.coreSpacing}px;
      border-radius: 8px;
      border: none;

      &:focus {
        outline: 0;
        box-shadow: none;
      }
    }
  }
`;

const ErxesContent = styledTS<{ isTabbed: boolean }>(styled.div)`
  height: 100%;
  margin-top: ${(props) => (props.isTabbed ? '0px' : '-40px')};
  flex: 1;
  overflow: auto;
  z-index: 5;
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

const ErxesStaffProfile = styledTS<{ state?: boolean }>(styled.div)`
  width: 100px;
  margin: ${(props) => (props.state ? '-50px auto 0' : '')};

    > .avatar-profile {
    img {
      width: 100px;
      height: 100px;
      object-fit: cover;
      border-radius: 50%;
      }    
    }
  
`;

const AvatarWrapper = styledTS<{ state?: boolean }>(styled.div)`
  width: 100px;
  height: 100px;
  margin: 0 auto 64px;
`;

const StateSpan = styledTS<{ state: boolean }>(styled.span)`
  border-radius: ${unitSpace};
  height: 8px;
  width: 8px;
  bottom: 2px;
  position: absolute;
  right: 2px;
  background-color: ${(props) =>
    props.state ? colors.colorCoreGreen : colors.colorLightGray};
`;

const ErxesSupporters = styled.div`
  padding-top: ${unitSpace};
  display: flex;
  flex-wrap: wrap;

  img {
    border-radius: 22px;
    height: 40px;
    width: 40px;
    object-fit: cover;
  }
`;

const Script = styled.div`
  padding-top: ${dimensions.coreSpacing}px;

  ol {
    padding-left: ${dimensions.coreSpacing}px;
  }
`;

const FlexStartHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
`;

const ScriptWrapper = styled.div`
  background: #f5f5f5;
  width: 100%;
  padding: 16px;
  border-radius: 6px;
  margin-top: 24px;
`;

const ScriptLoader = styled.div`
  height: 350px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  h2 {
    font-size: 34px;
    font-weight: 400;
    text-align: center;
  }

  .spinner {
    width: 50px;
    height: 50px;
  }
  .double-bounce1 {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #ffc82c;
    -webkit-animation: bounce 2s infinite ease-in-out;
    animation: bounce 2s infinite ease-in-out;
  }
  @keyframes bounce {
    0%,
    100% {
      transform: scale(0);
      -webkit-transform: scale(0);
    }
    50% {
      transform: scale(1);
      -webkit-transform: scale(1);
      background-color: #ffc82c;
    }
  }
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  h3 {
    color: #4f33af;
    font-size: 20px;
    font-style: normal;
    font-weight: 500;
    line-height: 32px;
    letter-spacing: 0.15px;
    opacity: 0.5;
  }
`;

export {
  MainContent,
  Content,
  RightSidebarContent,
  CarouselWrapper,
  LeftSidebar,
  SidebarHeader,
  WelcomeContainer,
  ProgressBar,
  CircleBackground,
  Circle,
  IndicatorText,
  ButtonContainer,
  SidebarContent,
  ColorChooserWrapper,
  WidgetPreviewStyled,
  ErxesGreeting,
  ErxesTopbar,
  GreetingInfo,
  Links,
  Socials,
  TopBarIcon,
  ContentBox,
  ErxesContent,
  LeftSide,
  RightSide,
  ErxesStaffProfile,
  ErxesSupporters,
  StateSpan,
  Script,
  TopBarTab,
  FlexStartHeader,
  ScriptWrapper,
  ErxesMiddleTitle,
  GeneralInformationForm,
  GeneralInformationWrapper,
  ScriptLoader,
  TextContainer,
  AvatarWrapper,
  SuccessContent,
};
