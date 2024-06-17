import { colors, dimensions } from '../../styles';
import { BoxRoot } from '../../styles/main';
import { ContentHeader } from '../../layout/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Embedded, PreviewContainer, SlideLeftContent } from './preview/styles';

const Space = `${dimensions.unitSpacing + dimensions.coreSpacing}px`;

const Box = styledTS<{ selected?: boolean }>(styled(BoxRoot))`
  padding: ${dimensions.coreSpacing * 1.5}px;
  width: 50%;
  background: ${colors.colorWhite};
  min-width: 160px;
  i {
    font-size: 34px;
    color: ${colors.colorSecondary};
  }
  span {
    font-weight: ${props => props.selected && '500'};
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

const FullPreview = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${dimensions.coreSpacing}px;
  overflow: auto;
`;

const BackgroundSelector = styledTS<{ selected?: boolean }>(styled.li)`
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
  padding: ${dimensions.unitSpacing / 2}px;
  margin-right: ${dimensions.unitSpacing / 2}px;
  border: 1px solid
    ${props => (props.selected ? colors.colorShadowGray : 'transparent')};
  > div {
    height: ${dimensions.headerSpacing - 20}px;
    width: ${dimensions.headerSpacing - 20}px;
    background: ${colors.borderPrimary};
    border-radius: 50%;
    text-align: center;
    line-height: ${dimensions.headerSpacing - 20}px;
    > i {
      visibility: ${props => (props.selected ? 'visible' : 'hidden')};
      font-size: ${dimensions.unitSpacing}px;
      color: ${colors.colorWhite};
      &:before {
        font-weight: 700;
      }
    }
  }
`;

const ImageUpload = styled.div`
  border: 1px dashed ${colors.borderDarker};
  border-radius: 5px;
  background: ${colors.colorLightBlue};
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  position: relative;
  padding: 10px;
  transition: border ease 0.3s;

  input {
    display: none;
  }

  label {
    margin: 0;
    text-align: center;
    flex: 1;
    cursor: pointer;

    i {
      font-size: 22px;
      display: block;
      color: ${colors.colorCoreGray};
      margin-bottom: 5px;
    }
  }

  button {
    position: absolute;
    right: ${dimensions.unitSpacing}px;
    top: ${dimensions.unitSpacing}px;
    padding: 5px 8px;
    border-radius: ${Space};
    background: ${colors.borderPrimary};
  }

  &:hover {
    border-color: ${colors.colorCoreTeal};
  }
`;

const CarouselInner = styledTS<{ selected?: boolean }>(styled.div)`
  text-align: center;
  transition: all ease 0.3s;
  flex: 1;

  li {
    align-items: center;
    display: flex;
    padding: ${dimensions.coreSpacing}px 0 ${dimensions.unitSpacing / 2}px 0;

    span {
      padding: ${dimensions.unitSpacing / 2}px;
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

const CarouselSteps = styled.ul`
  display: flex;
  padding: 0;
  margin: 0;
`;

const DesktopPreview = styled.div`
  background: url('/images/previews/desktop.png') no-repeat;
  background-size: cover;
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing / 2}px;
  flex: 1;
  overflow: auto;
  padding-top: ${dimensions.headerSpacing - 20}px;
  margin-top: ${dimensions.coreSpacing}px;
`;

const ImagePreview = styled.img`
  width: 300px;
  max-width: 300px;
`;

const TabletPreview = styled.div`
  background: url('/images/previews/tablet.png') no-repeat center center;
  width: 768px;
  height: 1024px;
  margin: 0 auto;
  padding: 80px ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.coreSpacing}px;
`;

const FlexColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  ${ContentHeader} {
    border-bottom: none;
    border-top: 1px solid ${colors.borderPrimary};
  }
`;

const PreviewWrapper = styled.div`
  width: 40%;
  background: ${colors.colorWhite};
  margin-left: 5px;

  ${TabletPreview} {
    background-size: contain;
    width: 85%;
    height: 100%;

    ${PreviewContainer} {
      max-height: 600px;
    }

    @media (max-width: 1400px) {
      padding: 40px 10px;
    }
  }
`;

const LabelWrapper = styled.div`
  margin-bottom: 10px;
`;

export {
  Box,
  BoxRow,
  FlexItem,
  ImageUpload,
  ImagePreview,
  FlexColumn,
  PreviewWrapper,
  BackgroundSelector,
  CarouselInner,
  CarouselSteps,
  DesktopPreview,
  FullPreview,
  MobilePreview,
  TabletPreview,
  LabelWrapper
};
