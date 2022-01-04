import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { Embedded, PreviewContainer, SlideLeftContent } from './preview/styles';

const Space = `${dimensions.unitSpacing + dimensions.coreSpacing}px`;

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

export {
  FlexItem,
  ImageUpload,
  ImagePreview,
  PreviewWrapper,
  CarouselInner,
  CarouselSteps,
  DesktopPreview,
  FullPreview,
  MobilePreview,
  TabletPreview
};
