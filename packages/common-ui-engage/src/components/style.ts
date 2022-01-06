import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { slideLeft } from '@erxes/ui/src/utils/animations';

const SlideLeftContent = styled.div`
  position: absolute;
  width: 380px;
  background: ${colors.bgLight};
  bottom: 20px;
  left: 20px;
  box-shadow: 0 3px 20px 0px ${rgba(colors.colorBlack, 0.3)};
  border-radius: ${dimensions.unitSpacing}px;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ${slideLeft} 0.5s linear;

  @media (max-width: 1300px) {
    width: 100%;
  }
`;

const PreviewContainer = styled.div`
  position: relative;
  height: 100%;
  padding: 20px;
`;

const Embedded = styled.div`
  position: absolute;
  top: ${dimensions.unitSpacing}%;
  left: ${dimensions.unitSpacing / 2}%;
  width: 70%;
  background: ${colors.bgLight};
  padding: ${dimensions.unitSpacing / 2}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  box-shadow: 0 0 ${dimensions.unitSpacing}px ${colors.colorShadowGray} inset;
  max-height: 90%;
  display: flex;
  border-radius: ${dimensions.unitSpacing}px;
  flex-direction: column;

  @media (max-width: 1300px) {
    width: 90%;
  }
`;

const FlexItem = styled.div`
  display: flex;
  height: 100%;
`;

const FullPreview = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${dimensions.coreSpacing}px;
  overflow: auto;
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

export {
  FlexItem,
  DesktopPreview,
  MobilePreview,
  TabletPreview,
  FullPreview,
  PreviewContainer
};
