import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import { BoxRoot } from 'modules/common/styles/main';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Embedded, PreviewContainer, SlideLeftContent } from './preview/styles';

const Space = `${dimensions.unitSpacing + dimensions.coreSpacing}px`;

const Box = styledTS<{ selected?: boolean }>(BoxRoot.extend)`
  border: 1px solid
    ${props => (props.selected ? colors.colorPrimary : colors.borderPrimary)};
  padding: ${dimensions.coreSpacing * 2}px;
  width: 50%;

  i {
    font-size: 36px;
    color: ${colors.colorSecondary};
  }

  &:last-child {
    margin-right: 0;
  }
`;

const BoxRow = styledTS<{ type?: string }>(styled.div)`
  display: flex;
  flex-direction: row;
  margin-right: ${props => props.type && '20px'};
`;

const FlexItem = styled.div`
  display: flex;
  height: 100%;
`;

const FullPreview = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: ${dimensions.coreSpacing}px;
  overflow: auto;
`;

const BackgroundSelector = styledTS<{ selected?: boolean }>(styled.li)`
  display: inline-block;
  cursor: pointer;
  margin-left: ${dimensions.unitSpacing}px;
  border-radius: 50%;
  border: 1px solid
    ${props => (props.selected ? colors.colorPrimary : 'transparent')};

  > div {
    height: ${dimensions.headerSpacing - 20}px;
    width: ${dimensions.headerSpacing - 20}px;
    margin: ${dimensions.unitSpacing / 2}px;
    background: ${colors.borderPrimary};
    border-radius: 50%;
    line-height: ${dimensions.headerSpacing - 20}px;
  }
`;

const ColorPicker = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: ${dimensions.unitSpacing / 2}px;
  border: 1px solid ${colors.colorShadowGray};
  cursor: pointer;
  margin: 0 ${dimensions.unitSpacing}px ${dimensions.unitSpacing / 2}px;
`;

const Picker = styled.div`
  width: 80px;
  height: 15px;
`;

const ImageContent = styled.div`
  border: 1px dashed ${colors.borderDarker};
  border-radius: 5px;
  background: ${colors.colorLightBlue};
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  position: relative;

  img {
    max-width: 300px;
  }

  i {
    visibility: hidden;
    cursor: pointer;
    position: absolute;
    right: 5%;
    top: ${dimensions.coreSpacing}px;
    width: ${Space};
    border-radius: ${Space};
    text-align: center;
    line-height: ${Space};
    background: rgba(255, 255, 255, 0.5);
    transition: all ease 0.3s;
  }

  &:hover {
    i {
      visibility: visible;
    }
  }
`;

const CarouselInner = styledTS<{ selected?: boolean }>(styled.div)`
  text-align: center;
  transition: all ease 0.3s;
  flex: 1;

  li {
    align-items: center;
    display: flex;
    padding: ${dimensions.coreSpacing}px 0 ${dimensions.unitSpacing}px 0;

    span {
      padding: ${dimensions.unitSpacing}px;
      border-radius: 50%;
      background-color: rgb(255, 255, 255);
      border: 2px solid
        ${props =>
          props.selected ? colors.colorPrimary : colors.colorShadowGray};

      &:hover {
        cursor: pointer;
        border-color: ${props => !props.selected && colors.borderPrimary};
      }
    }

    &:before,
    &:after {
      border-top: 2px solid ${colors.borderDarker};
      content: " ";
      width: 100%;
    }
  }

  span {
    padding-bottom: ${dimensions.coreSpacing}px;
  }

  &:first-child {
    li {
      &:before {
        visibility: hidden;
      }
    }
  }

  &:last-child {
    li {
      &:after {
        visibility: hidden;
      }
    }
  }
`;

const CarouselSteps = styled.ol`
  display: flex;
  padding: 0;
`;

const MarkdownWrapper = styled.div`
  position: relative;
  background: ${colors.bgLight};
  border: 1px solid ${colors.colorShadowGray};
`;

const DesktopPreview = styled.div`
  background: url('/images/previews/desktop.png') no-repeat;
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing / 2}px;
  flex: 1;
  padding-top: ${dimensions.headerSpacing - 20}px;
  margin-top: ${dimensions.coreSpacing}px;
`;

const MobilePreview = styled.div`
  background: url('/images/previews/mobile.png') no-repeat;
  width: 376px;
  height: 650px;
  margin: 0 auto;
  padding: 90px ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.coreSpacing}px;

  ${PreviewContainer} {
    overflow: hidden;
  }

  ${SlideLeftContent} {
    width: 100%;
  }

  ${Embedded} {
    width: 100%;
    left: 0;
  }
`;

const TabletPreview = styled.div`
  background: url('/images/previews/tablet.png') no-repeat center center;
  width: 768px;
  height: 1024px;
  margin: 0 auto;
  padding: 80px ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.coreSpacing}px;
`;

const Tabs = styledTS<{ selected?: boolean }>(styled.div)`
  display: inline-block;
  padding: ${dimensions.unitSpacing / 2}px ${dimensions.coreSpacing}px;
  background-color: ${props =>
    props.selected
      ? rgba(colors.colorPrimaryDark, 0.8)
      : colors.colorPrimaryDark};
  color: ${colors.colorWhite};
  border: 1px solid
    ${props =>
      props.selected ? colors.colorPrimaryDark : colors.colorPrimary};
  transition: all ease 0.3s;

  &:hover {
    cursor: pointer;
    background-color: ${props =>
      !props.selected && rgba(colors.colorPrimaryDark, 0.9)};
  }
`;

const FlexColumn = styled.div`
  display: flex;
  min-width: 43.33333%;
  flex-direction: column;
`;

export {
  FlexItem,
  FlexColumn,
  ColorPicker,
  Picker,
  BackgroundSelector,
  Box,
  BoxRow,
  DesktopPreview,
  MobilePreview,
  TabletPreview,
  CarouselSteps,
  MarkdownWrapper,
  Tabs,
  CarouselInner,
  FullPreview,
  ImageContent
};
