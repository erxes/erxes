import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const transitionName = 'slide-in';

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  justify-content: center;
`;

const LeftContainer = styled.div`
  flex: 1;
  display: flex;

  &.move-appear,
  &.move-enter {
    transform: translateX(-50px);
  }

  &.move-appear-active,
  &.move-enter-active {
    transform: translateX(0);
    transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
  }
`;

const RightContent = styled.div`
  width: 500px;
  flex-shrink: 0;
  padding: 100px;
  background: ${colors.colorPrimaryDark};
  display: flex;
  align-items: center;
  overflow: auto;
`;

const ScrollContent = styled.div`
  padding: 50px 100px;
  max-height: 100%;
  overflow: auto;
`;

const LeftContent = styled.div`
  margin: 100px -100px 100px 100px;
  padding-bottom: 52px;
  z-index: 1;
  flex: 1;
  background: ${colors.colorWhite};
  box-shadow: 0px 0px 30px 3px rgba(0, 0, 0, 0.1);
  position: relative;

  .${transitionName}-appear
    ${ScrollContent},
    .${transitionName}-enter
    ${ScrollContent} {
    opacity: 0;
    transform: translateY(20px);
  }

  .${transitionName}-appear-active
    ${ScrollContent},
    .${transitionName}-enter-active
    ${ScrollContent} {
    opacity: 1;
    transform: translateY(0);
    transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95) 0.2s;
  }

  .${transitionName}-exit
    ${ScrollContent},
    .${transitionName}-exit-active
    ${ScrollContent} {
    opacity: 0;
    transform: translateY(-20px);
    transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
  }

  > form {
    height: 100%;
    position: absolute;
    padding-bottom: 52px;
    left: 0;
    right: 0;
  }
`;

const TopContent = styled.div`
  text-align: center;
  margin-bottom: 30px;
  position: relative;

  img {
    height: 120px;
  }

  h2 {
    margin-bottom: 0;
    font-weight: normal;
  }

  &::after {
    content: '';
    position: absolute;
    width: 120px;
    height: 120px;
    background: aliceblue;
    top: 0;
    border-radius: 60px;
    z-index: -1;
    margin-left: -30px;
  }
`;

const Description = styled.div`
  font-size: 14px;
  margin: 40px 0 20px;
  color: ${colors.colorCoreGray};
`;

const Footer = styled.div`
  padding: 10px 20px;
  box-shadow: 0px -2px 6px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Logo = styled.img`
  position: absolute;
  left: 100px;
  top: 30px;
  height: 40px;
`;

const Robot = styled.img`
  position: absolute;
  right: -80%;
  bottom: -100%;
  width: 400px;
  height: auto !important;
`;

const WelcomeWrapper = styled.div`
  align-self: center;
  text-align: center;
  max-width: 100%;
  width: 420px;
  position: relative;

  h1 {
    color: ${colors.colorCoreBlack};
    margin-bottom: 20px;
  }

  p {
    color: ${colors.colorCoreGray};
    margin-bottom: 30px;
  }

  img {
    height: 60px;
  }
`;

const Indicator = styled.div`
  z-index: 10;

  &.move-appear,
  &.move-enter {
    opacity: 0;
    transform: translateX(20px);
  }

  &.move-appear-active,
  &.move-enter-active {
    opacity: 1;
    transform: translateX(0);
    transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
  }
`;

const Item = styledTS<{ active?: boolean }>(styled.div)`
  position: relative;
  color: ${props =>
    props.active ? rgba(colors.colorWhite, 0.8) : rgba(colors.colorWhite, 0.4)};
  padding-left: 40px;
  margin-bottom: 40px;
  transition: color .3s ease;

  &:hover {
    cursor: pointer;
  }

  &:last-of-type {
    margin-bottom: 0;
  }

  &::before {
    background-color: ${props =>
      props.active ? colors.colorPrimary : colors.colorWhite};
    color: ${props =>
      props.active ? colors.colorWhite : colors.colorLightGray};
    font-weight: bold;
    content: attr(data-number);
    transition: all .3s ease;
    position: absolute;
    left: -20px;
    width: 40px;
    height: 40px;
    text-align: center;
    line-height: 40px;
    box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    z-index: 1;
  }

  h4 {
    color: ${props => props.active && colors.colorWhite};
  }

  p {
    margin: 0;
  } 
`;

export {
  MainContainer,
  LeftContainer,
  RightContent,
  TopContent,
  LeftContent,
  ScrollContent,
  Description,
  Footer,
  Logo,
  Robot,
  Indicator,
  Item,
  WelcomeWrapper
};
