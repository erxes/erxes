import styled from 'styled-components';
import { colors, dimensions } from 'modules/common/styles';
import { PreviewContainer } from './preview/style';

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

export { FlexItem, FullPreview, PreviewWrapper, TabletPreview };
