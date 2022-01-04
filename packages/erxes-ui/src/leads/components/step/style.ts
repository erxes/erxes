import { colors, dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';
import { PreviewContainer } from './preview/styles';

const Space = `${dimensions.unitSpacing + dimensions.coreSpacing}px`;

const FlexItem = styled.div`
  display: flex;
  height: 100%;
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

export { FlexItem, ImageUpload, ImagePreview, PreviewWrapper };
