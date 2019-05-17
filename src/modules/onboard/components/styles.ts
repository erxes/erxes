import { colors } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Header = styled.div`
  height: 70px;
  background: ${colors.colorWhite};
  text-align: center;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: relative;

  img {
    height: 40px;
    margin: 15px 0;
  }

  a {
    position: absolute;
    right: 25px;
    top: 25px;
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: ${colors.bgMain};
  overflow: hidden;
  z-index: 11;
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;

  .slide-in-small-appear,
  .slide-in-small-enter {
    opacity: 0;
    transform: translateY(10px);
  }

  .slide-in-small-appear-active,
  .slide-in-small-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
  }

  .slide-in-small-exit,
  .slide-in-small-exit-active {
    opacity: 0;
    transform: translateY(10px);
    transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
  }
`;

const RightContent = styled.div`
  flex-shrink: 0;
  padding: 70px;
  background: ${colors.colorPrimaryDark};
  display: flex;
  align-items: center;
  overflow: auto;
  flex: 1;
`;

const Footer = styled.div`
  text-align: center;

  a {
    cursor: pointer;
  }

  > div {
    margin-bottom: 15px;
  }
`;

const LeftContent = styled.div`
  z-index: 1;
  flex: 1;
  position: relative;
  min-width: 640px;
  display: flex;
  padding: 70px;

  .slide-in-appear,
  .slide-in-enter {
    opacity: 0;
    transform: translateY(20px);
  }

  .slide-in-appear-active,
  .slide-in-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95) 0.2s;
  }

  .slide-in-exit,
  .slide-in-exit-active {
    opacity: 0;
    transform: translateY(-20px);
    transition: all 300ms cubic-bezier(0.445, 0.05, 0.55, 0.95);
  }

  > form {
    position: absolute;
    width: 640px;
    min-height: 450px;
    align-self: center;
    padding: 70px 70px 50px 70px;
    right: -70px;
    overflow: auto;
    max-height: 100%;
    border-radius: 2px;
    background: ${colors.colorWhite};
    box-shadow: rgba(0, 0, 0, 0.1) 0px 0px 20px 3px;
  }
`;

const TopContent = styled.div`
  margin-bottom: 40px;
  position: relative;

  h2 {
    margin-top: 0;
    font-weight: normal;
    margin-bottom: 30px;
  }
`;

const Indicator = styled.div`
  z-index: 10;
  width: 400px;

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
      props.active ? colors.colorCoreTeal : colors.colorWhite};
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
    display: flex;
    align-items: center;

    span {
      width: 18px;
      height: 18px;
      border-radius: 9px;
      background: ${colors.colorCoreYellow};
      color: ${colors.colorCoreDarkGray};
      font-size: 9px;
      margin-left: 8px;
      display: flex;
      justify-content: center;

      i {
        margin-top: 4px;
      }
    }
  }

  p {
    margin: 0;
  } 
`;

const WelcomeWrapper = styled.div`
  padding: 20px;
  z-index: 1;
  text-align: center;

  h1 {
    color: ${colors.colorPrimaryDark};
    margin-top: 40px;
    font-size: 30px;
  }

  p {
    color: ${colors.colorCoreGray};
    margin-bottom: 30px;
  }
`;

const Description = styled.div`
  font-size: 14px;
  margin: 40px 0 20px;
  color: ${colors.colorCoreGray};

  i {
    color: ${colors.colorCoreRed};
  }
`;

const WelcomeImage = styled.img`
  width: 360px;
  max-width: 100%;
`;

const ModalBottom = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: center;

  a {
    cursor: pointer;
    margin-left: 20px;
  }
`;

export {
  Header,
  MainContainer,
  ContentContainer,
  RightContent,
  TopContent,
  LeftContent,
  Description,
  Footer,
  WelcomeImage,
  Indicator,
  Item,
  WelcomeWrapper,
  ModalBottom
};
