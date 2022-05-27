import { colors, dimensions, typography } from "../styles";
import { rgba } from "../styles/ecolor";
import styled, { css } from "styled-components";
import styledTS from "styled-components-ts";

const Header = styledTS<{
  color?: string;
  backgroundImage?: string;
  headingSpacing?: boolean;
}>(styled.div)`
  padding: ${(props) => (props.headingSpacing ? "30px 30px 180px" : "30px 0")};
  color: ${colors.colorWhite};
  font-size: ${typography.fontSizeBody}px;
  background-color: ${(props) => (props.color ? props.color : "#f5f8fb")};
  background-image: ${(props) =>
    props.backgroundImage && `url(${props.backgroundImage})`};

  h3 {
    font-size: 1.75rem;
    font-weight: ${typography.fontWeightLight};
    margin: 20px 0;
  }

  .modal-content {
    background: transparent;
    border: 0;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const HeaderLogo = styled.div`
  display: flex;
  align-items: center;

  img {
    max-height: 40px;
    -webkit-filter: brightness(0) invert(1);
    filter: brightness(0) invert(1);
    cursor: pointer;
  }
`;

const HeaderTitle = styled.span`
  margin-left: 10px;
  padding-left: 10px;
  border-left: 1px solid ${colors.colorWhite};
  font-size: 16px;
  letter-spacing: 1px;
  text-transform: capitalize;
`;

const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-basis: 0;
  -ms-flex-positive: 1;
  flex-grow: 1;
  min-width: 0;
  max-width: 100%;
  align-items: baseline;
`;

const SupportMenus = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  margin-bottom: 10px;

  a {
    margin-left: 10px;
    letter-spacing: 0.5px;
    opacity: 0.8;
  }

  > button {
    color: ${colors.colorWhite} !important;
  }
`;

const WebLink = styled.a`
  -ms-flex: 0 0 auto;
  flex: 0 0 auto;
  width: auto;
  max-width: 100%;
`;

const HeaderLinks = styled.div`
  text-align: right;
`;

const LinkItem = styledTS<{ active?: boolean }>(styled.span)`
  display: inline-block;
  padding-right: ${dimensions.unitSpacing}px;
  margin-right: ${dimensions.unitSpacing}px;
  font-size: 14px;
  opacity: 0.9;
  border-right: 1px solid #fff;
  text-transform: capitalize;
  position: relative;
  transition: all ease 0.3s;

  &:last-child {
    margin-right: 0;
    border-right: 0;
  }

  border-bottom: 2px solid transparent;

  ${(props) =>
    props.active &&
    `
    font-weight: 600;
    opacity: 1;

    &:after {
      content: '.';
      position absolute;
      bottom: -15px;
      left: 45%;
      font-size: 25px;
    }
  `}

  &:hover {
    opacity: 1;
  }
`;

const MainContent = styledTS<{ baseColor?: string; bodyColor?: string }>(
  styled.div
)`
  background-color: ${(props) =>
    props.bodyColor ? props.bodyColor : "#f5f8fb"};
  min-height: 60vh;
  padding: 32px 0;

  ${(props) =>
    props.baseColor &&
    css`
      .base-color {
        color: ${props.baseColor} !important;
      }
    `};
`;

const Container = styledTS<{ transparent?: boolean; shrink?: boolean }>(
  styled.div
)`
  width: ${dimensions.wrapperWidth}%;
  margin: 0 auto;

  ${(props) =>
    !props.shrink &&
    css`
      height: 100%;
      height: calc(100% - 20px);
    `};
  
  @media (max-width: 1200px) {
    width: 80%;
  }

  @media (max-width: 800px) {
    width: 90%;
  }
`;

const BoxRoot = styledTS<{ selected?: boolean }>(styled.div)`
  text-align: center;
  float: left;
  background: ${colors.colorLightBlue};
  box-shadow: ${(props) =>
    props.selected
      ? `0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)}`
      : `0 6px 10px 1px ${rgba(colors.colorCoreGray, 0.08)}`} ;
  margin-right: ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  border-radius: ${dimensions.unitSpacing / 2 - 1}px;
  transition: all 0.25s ease;
  border: 1px solid
    ${(props) =>
      props.selected ? colors.colorSecondary : colors.borderPrimary};

  > a {
    display: block;
    padding: ${dimensions.coreSpacing}px;
    text-decoration: none;

    &:focus {
      text-decoration: none;
    }
  }

  img {
    width: 83px;
    transition: all 0.5s ease;
  }

  span {
    color: ${colors.colorCoreGray};
    display: block;
    margin-top: ${dimensions.unitSpacing}px;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};

    span {
      font-weight: 500;
    }

    img {
      transform: scale(1.1);
    }
  }

  @media (max-width: 780px) {
    width: 100%;
  }
`;

const SearchContainer = styledTS<{ focused: boolean }>(styled.div)`
  position: relative;
  ${(props) =>
    props.focused &&
    css`
      i {
        color: ${colors.colorCoreGray};
      }
    `};

  input {
    border: 0;
    background: none;
    width: 100%;
    background: rgba(255, 255, 255, 0.2);
    font-size: 18px;
    border-radius: 5px;
    padding: 20px 32px 20px 60px;
    color: ${rgba(colors.colorWhite, 0.8)};
    transition: all 0.3s linear;

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
      font-weight: 400;
    }

    &:focus,
    &:active {
      background: ${colors.colorWhite};
      color: #666;
    }
  }

  input:focus::-webkit-input-placeholder {
    color: rgba(0, 0, 0, 0.5);
    font-weight: 400;
  }

  i {
    font-size: 22px;
    cursor: pointer;
    position: absolute;
    top: 14px;
  }

  i:nth-child(1) {
    left: 20px;
  }

  i:nth-child(2) {
    right: 20px;
  }

  
`;

const Footer = styledTS<{ color?: string; backgroundImage?: string }>(
  styled.div
)`
  background-color: ${(props) =>
    props.color ? props.color : colors.colorPrimary};
  padding: 40px 0;
  color: ${colors.colorWhite};
  text-align: center;

  h4 {
    text-transform: uppercase;
    font-size: 14px;
    letter-spacing: 1px;
  }

  p {
    color: rgba(255,255,255,.7);
    font-size: 14px;
    width: 500px;
    margin: 0 auto;
    margin-bottom: 20px;
  }
`;

const FooterLink = styled.a`
  width: 32px;
  height: 32px;
  margin: 5px 5px 0px 5px;
  border-radius: 16px;
  display: inline-block;
  background: #fff;
  transition: background 0.3s ease;
  font-size: 14px;
  padding: 6px;

  img {
    width: 100%;
    filter: contrast(0) sepia(100%) hue-rotate(0deg) brightness(0.4) saturate(0);
  }

  &:hover {
    background: #eee;
  }
`;

const ModalWrapper = styledTS<{ isFull?: boolean }>(styled.div)`
  .client-modal {
    position: fixed;
    overflow: auto;
    z-index: 9;
    background: rgba(48, 67, 92, .6);
    width: 100%;
    height: 100vh;
    top: 0;
    left: 0;

    > div {
      position: relative;
      z-index: 99;
      width: 60%;
      max-width: ${(props) => (props.isFull ? "900px" : "600px")};
      border-radius: 2px;
      margin: 100px auto;
    }
  }
`;

const ModalClose = styled.div`
  position: absolute;
  right: 10px;
  top: 20px;
  width: 30px;
  height: 30px;
  background: rgba(0, 0, 0, 0.3);
  line-height: 30px;
  border-radius: 15px;
  text-align: center;
  color: #fff;
  cursor: pointer;
`;

const HeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  button {
    border: 1px solid ${colors.colorWhite};
    background: transparent;
    opacity: 0.9;
    transition: all ease 0.3s;

    &:hover {
      opacity: 1;
      background: transparent;
    }
  }

  > div:first-child {
    width: 60%;
    margin-right: ${dimensions.coreSpacing}px;

    @media (max-width: 1550px) {
      width: 45%;
    }
  }

  .right {
    @media (max-width: 1140px) {
      button {
        margin-bottom: ${dimensions.unitSpacing}px;
      }
    }
  }
`;

const FormWrapper = styled.div`
  background: ${colors.colorWhite};
  border-radius: 5px;

  h4 {
    color: ${colors.textPrimary};
    font-weight: 600;
    font-size: 18px;
    padding: 20px 40px;
    border-radius: 5px 5px 0 0;
    background: ${colors.bgLight};
    border-bottom: 1px solid #eee;
    margin: 0;
  }

  .content {
    padding: 20px 40px;

    > div:last-child {
      margin-bottom: 10px;
    }

    .right {
      text-align: right;
    }
  }
`;

export {
  Header,
  HeaderTop,
  HeaderLogo,
  HeaderTitle,
  HeaderRight,
  HeaderLeft,
  SupportMenus,
  WebLink,
  HeaderLinks,
  MainContent,
  Container,
  BoxRoot,
  SearchContainer,
  Footer,
  FooterLink,
  LinkItem,
  ModalWrapper,
  ModalClose,
  HeaderWrapper,
  FormWrapper,
};
