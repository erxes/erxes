import { colors, dimensions, typography } from '@erxes/ui/src/styles';

import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

// Main page

const ImageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: ${dimensions.coreSpacing}px;
  height: 250px;
  background-color: ${colors.colorPrimary};
  border-radius: 8px;
  position: relative;
  color: ${colors.colorWhite};
  font-weight: 700;
  font-size: 20px;
  background-image: url('/images/stars.png');

  img {
    position: absolute;
    right: 0;
    bottom: 0;
  }
`;

// Leftbar

const MainContainer = styledTS<{ active?: boolean }>(styled.section)`
  height: 100%;
  max-width: 20%;
  display: flex;
  flex-direction: column;
`;

const SearchContainer = styledTS<{ active?: boolean }>(styled.div)`
  position: relative;
  transition: .3s all;
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const Search = styled.div`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;
  height: 100%;
  display: flex;
  align-items: center;
  position: relative;
  padding: 6px;

  input {
    background: 0 0;
    border: none;
    flex: 1;
    outline: 0;
  }
`;

const FilterContainer = styledTS<{ active?: boolean }>(styled.div)`
  transition: .s all;
  flex: 1;
  overflow: auto;
`;

const Filter = styled.div`
  border-radius: 8px;
  height: 100%;
  border: 1px solid ${colors.borderPrimary};
`;

const FilterHeader = styled.div`
  display: flex;
  height: 40px;
  justify-content: space-between;
  padding: 9px;
  align-items: center;
`;

const Box = styled.div`
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 1px solid ${colors.borderPrimary};
`;

const PaddingLeft = styled.div`
  padding-left: ${dimensions.unitSpacing}px;
  font-weight: 700;
`;

const PaddingBottom = styled.div`
  padding-bottom: 5px;
`;

// Plugin Preview

const ListHeader = styled.div`
  padding: 15px 0px;
`;

const ListTitle = styled.b`
  font-size: ${typography.fontSizeHeading6}px;
`;

const ColorText = styled.b`
  color: ${colors.colorPrimary};
`;

const PluginContainer = styled.div`
  display: flex;
  flex-wrap: wrap;

  b {
    font-size: 12px;
  }
`;

const CardWrapper = styled.div`
  margin-right: ${dimensions.unitSpacing}px;
  margin-bottom: ${dimensions.unitSpacing}px;
  width: 23%;
  min-width: 250px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;
`;

const Card = styled.div`
  width: inherit;
  padding: ${dimensions.unitSpacing}px;
  color: ${colors.textPrimary};
  border-radius: 8px;

  &:hover {
    box-shadow: 0 5px 15px ${rgba(colors.colorCoreDarkGray, 0.12)};
    cursor: pointer;
    transition: 0.3s;
  }
`;

const PluginPic = styled.img`
  width: 60px;
  height: 60px;
`;

const PluginInformation = styled.div`
  margin-top: ${dimensions.unitSpacing}px;

  .title {
    font-size: 14px;
  }

  b {
    text-transform: capitalize;
  }

  p {
    margin: 0;

    .gray {
      color: ${colors.textSecondary};
      line-height: 25px;
    }
  }
`;

const Description = styled.p`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden !important;
`;

// Detail main content

const DetailMainContainer = styled.div`
  height: 100%;
  border-radius: 8px;
  border: 1px solid ${colors.borderPrimary};
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  overflow-x: hidden;
  ::-webkit-scrollbar {
    display: none;
  }
  p {
    margin: 0;
  }
`;

const PluginTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  img {
    max-width: 70px;
    max-height: 70px;
    margin-right: ${dimensions.coreSpacing}px;
  }

  b {
    font-size: 20px;
  }

  button {
    float: left;
    margin-right: 5px;
    background: rgb(103, 63, 189);
    border-radius: 5px;
    color: rgb(255, 255, 255);
    border: none;
    font-weight: 500;
    outline: 0px;
    padding: 5px 15px;
    cursor: pointer;
  }

  .uninstall {
    background: #eb5a5a;
  }

  .install {
    background: #13ce66;
  }
`;

const Center = styled.div`
  display: flex;
  align-items: center;
`;

const DetailInformation = styled.div`
  display: flex;
  flex-direction: column;
  b {
    margin-bottom: ${dimensions.unitSpacing}px;
  }
`;

const Hashtag = styled.div`
  border-radius: 4px;
  color: ${colors.colorWhite};
  background: #000;
  padding: 2px 6px;
  margin-right: 5px;
  font-size: 11px;

  $:nth-last-child(1) {
    margin-right: 0;
  }
`;

const Detail = styled.div`
  padding-bottom: ${dimensions.unitSpacing}px;

  p {
    margin: 0;
  }
`;

// Carousel

const CarouselWrapper = styled.div`
  height: 300px;
  width: 100%;
  padding-bottom: ${dimensions.coreSpacing}px;
  margin: ${dimensions.coreSpacing}px 0;

  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const Buttons = styledTS<{ placement?: string }>(styled.div)`
  position: absolute;
  width: 100%;
  height: 280px;
  display: flex;
  justify-content: ${props => props.placement};
  align-items: center;
`;

const SliderButton = styledTS<{ active?: boolean; left?: boolean }>(styled.div)`
  display: ${props => (!props.active ? 'none' : 'flex')};
  color: ${colors.colorWhite};
  height: 100%;
  width: 100px;
  justify-content:center;
  align-items: center;

  &:hover {
    cursor: pointer;
    background-image: ${props =>
      props.left
        ? 'linear-gradient(to left, rgba(0,0,0,0), rgba(0,0,0,0.3));'
        : 'linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.3))'};
  }
`;

const Dots = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Dot = styledTS<{ active: boolean }>(styled.div)`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  margin: 0 3px;
  border: 1px solid ${props =>
    props.active ? colors.colorPrimary : colors.borderDarker};
  background-color: ${props => props.active && colors.colorPrimary};

  &:hover {
    cursor: pointer;
  }
`;

const Image = styledTS<{ image?: string }>(styled.div)`
  height: 280px;
  width: 100%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
`;

// Detail right sidebar

const SidebarWrapper = styled.div`
  width: 25%;
  max-width: 350px;

  a {
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const SidebarBox = styled.div`
  width: 100%;
  margin-bottom: ${dimensions.coreSpacing}px;
  padding: ${dimensions.unitSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;

  a {
    border-radius: 4px;
    border: 1px solid ${colors.borderPrimary};
    margin: ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px 0 0;
    padding: 2px 8px;
    color: ${colors.textSecondary} !important;
    display: flex;
    align-items: center;

    i {
      margin-right: 5px;
    }
  }
`;

const ColorHeader = styled.p`
  color: ${colors.colorPrimary};
  font-size: 14px;
  font-weight: bold;
  margin: 0;
`;

const DetailCard = styled.div`
  display: flex;
  margin-top: ${dimensions.unitSpacing}px;
  align-items: center;
`;

const MemberPic = styled.div`
  width: 39px;
  height: 39px;
  border: 2px solid ${rgba(colors.colorPrimary, 0.4)};
  border-radius: 50%;

  img {
    height: 35px;
  }
`;

const CardInformation = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
`;

const SmallText = styledTS<{ withMargin?: boolean }>(styled.span)`
  font-size: 11px;
  margin-top: ${props => props.withMargin && '5'}px;
`;

//**************

const inputPadding = '0px';
const inputHeight = '15px';
const inputScale = '12px';
const inputBorderWidth = '2px';

const WidgetApperance = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 100%;
`;

const FormLabel = styled.label`
  position: relative;
  display: inline-block;
  font-weight: normal;

  span {
    cursor: pointer;
    display: inline-block;
  }

  &:hover {
    color: ${colors.colorPrimary};
  }
`;

const inputStyle = styledTS<{ disabled?: boolean; color?: string }>(
  styled.input
)`
  border: 0 !important;
  clip: rect(1px, 1px, 1px, 1px) !important;
  clip-path: inset(50%) !important;
  height: 1px !important;
  overflow: hidden !important;
  padding: 0 !important;
  position: absolute !important;
  width: 1px !important;
  white-space: nowrap !important;
  cursor: ${props => props.disabled && 'not-allowed'}

  &:focus {
    + span {
      &::before {
        box-shadow: 0 0 0 2px rgba(#333, 0.4) !important;
      }
    }
  }

  &:hover {
    + span {
      &::before {
        border-color: ${props =>
          props.color ? props.color : colors.colorLightGray};
      }
    }
  }

  &:active {
    + span {
      &::before {
        transition-duration: 0;
      }
    }
  }

  + span {
    position: relative;
    padding: ${inputPadding};
    user-select: none;

    &:before {
      background-color: ${colors.colorWhite};
      border: ${inputBorderWidth} solid ${props =>
  props.color ? rgba(props.color, 0.7) : colors.colorShadowGray};
      box-sizing: content-box;
      content: '';
      color: ${colors.colorWhite};
      margin-right: calc(${inputHeight} * 0.25);
      top: 53%;
      left: 0;
      width: ${inputHeight};
      height: ${inputHeight};
      display: inline-block;
      vertical-align: text-top;
      border-radius: 50%;
      cursor: ${props => props.disabled && 'not-allowed'}
    }

    &:after {
      box-sizing: content-box;
      content: '';
      background-color: ${colors.colorWhite};
      position: absolute;
      top: 56%;
      left: calc(${inputPadding} + ${inputBorderWidth} + ${inputScale} / 2);
      width: calc(${inputHeight} - ${inputScale});
      height: calc(${inputHeight} - ${inputScale});
      margin-top: calc((${inputHeight} - ${inputScale}) / -2);
      transform: scale(0);
      transform-origin: 51%;
      transition: transform 200ms ease-out;
    }
  }

  + span:last-child:before {
    margin-right: 0px;
  }
`;

const Checkbox = styledTS<{ color?: string }>(styled(inputStyle))`
  + span {
    &:after {
      background-color: transparent;
      top: 53%;
      left: calc(1px + ${inputHeight} / 5);
      width: calc(${inputHeight} / 2);
      height: calc(${inputHeight} / 5);
      margin-top: calc(${inputHeight} / -2 / 2 * 0.8);
      border-style: solid;
      border-color: ${colors.colorWhite};
      border-width: 0 0 2px 2px;
      border-radius: 0;
      border-image: none;
      transform: rotate(-45deg) scale(0);
      transition: none;
    }
  }

  &:checked + span {
    &:before {
      animation: none;
      background-color: ${props =>
        props.color ? props.color : colors.colorSecondary};
      border-color: transparent;
    }

    &:after {
      content: '';
      transform: rotate(-45deg) scale(1);
      transition: transform 200ms ease-out;
    }
  }
`;

const AttachmentContainer = styled.div`
  display: flex;
  height: 300px;
  margin-top: 30px;
  overflow: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  img {
    width: 50%;
    object-fit: cover;
    margin-right: 10px;
    border-radius: 8px;
  }
`;

export {
  ImageWrapper,
  MainContainer,
  SearchContainer,
  Search,
  FilterContainer,
  Filter,
  FilterHeader,
  Box,
  PaddingLeft,
  PaddingBottom,
  ListHeader,
  ListTitle,
  ColorText,
  PluginContainer,
  CardWrapper,
  Card,
  PluginPic,
  PluginInformation,
  Description,
  DetailMainContainer,
  PluginTitle,
  Center,
  CarouselWrapper,
  Buttons,
  SliderButton,
  Dots,
  Dot,
  Image,
  DetailInformation,
  Hashtag,
  Detail,
  SidebarWrapper,
  SidebarBox,
  ColorHeader,
  DetailCard,
  MemberPic,
  CardInformation,
  SmallText,
  WidgetApperance,
  FormLabel,
  Checkbox,
  AttachmentContainer
};
