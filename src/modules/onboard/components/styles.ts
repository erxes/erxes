import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  position: relative;
  justify-content: center;
`;

const LeftContainer = styled.div`
  flex: 1;
  display: flex;
`;

const RightContent = styled.div`
  width: 500px;
  flex-shrink: 0;
  padding: 100px;
  background: ${colors.colorPrimaryDark};
  display: flex;
  align-items: center;
`;

const LeftContent = styled.div`
  margin: 100px -100px 100px 100px;
  padding: 100px;
  z-index: 1;
  flex: 1;
  background: ${colors.colorWhite};
  box-shadow: 0px 0px 30px 3px rgba(0, 0, 0, 0.1);
  position: relative;

  > img {
    height: 100px;
  }

  h2 {
  }
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

const Indicator = styled.div``;

const Item = styledTS<{ active?: boolean }>(styled.div)`
  position: relative;
  color: ${props =>
    props.active ? rgba(colors.colorWhite, 0.8) : rgba(colors.colorWhite, 0.4)};
  padding-left: 40px;
  margin-bottom: 40px;

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
  LeftContent,
  Footer,
  Logo,
  Robot,
  Indicator,
  Item,
  WelcomeWrapper
};
