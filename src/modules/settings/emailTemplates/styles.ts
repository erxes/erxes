import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

const IframePreview = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;

  iframe {
    transform: scale(0.5);
    transform-origin: 0 0;
    pointer-events: none;
    width: 200%;
    height: 280px;
    border: 0;
  }
`;

const TemplatePreview = styled.div`
  height: 100%;
  background: ${colors.colorWhite};
  padding: ${dimensions.coreSpacing}px;
  overflow: auto;
`;

const TemplateBox = styled.div`
  width: 100%;
  height: 140px;
  border: 1px solid ${colors.colorShadowGray};
  position: relative;
`;

const Options = styled.div`
  background: rgba(0, 0, 0, 0.8);
  display: none;
  position: absolute;
  z-index: 3;
  width: 100%;
  height: 100%;
  text-align: center;
  padding-top: ${dimensions.headerSpacing + 10}px;
  transition: all ease 0.3s;

  span {
    color: ${colors.bgLight};
    font-size: 15px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const EmailTemplates = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 18%;
  float: left;
  margin-right: ${dimensions.coreSpacing}px;
  transition: all ease 0.3s;

  > span {
    text-align: center;
    font-size: 12px;
    padding: ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px 0;
    margin-bottom: ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreGray};
    font-weight: 500;
    width: 100%;
    height: ${dimensions.headerSpacing}px;
    overflow: hidden;
  }

  &:hover {
    ${Options} {
      display: flex;
      justify-content: space-evenly;
    }
  }
`;

export { EmailTemplates, Options, TemplateBox, TemplatePreview, IframePreview };
