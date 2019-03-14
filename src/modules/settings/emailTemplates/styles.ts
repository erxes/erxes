import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';

const IframePreview = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 4px;

  iframe {
    transform: scale(0.4);
    transform-origin: 0 0;
    pointer-events: none;
    width: 250%;
    height: 500%;
    border: 0;
  }
`;

const TemplatePreview = styled.div`
  display: flex;
  height: 100%;
  background: ${colors.colorWhite};
  padding: ${dimensions.coreSpacing}px;
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
  padding-top: ${dimensions.coreSpacing + dimensions.coreSpacing}px;
`;

const Actions = styled.div`
  color: ${colors.bgLight};
  display: flex;
  justify-content: space-evenly;
  margin-top: ${dimensions.coreSpacing + dimensions.unitSpacing}px;

  span {
    cursor: pointer;
  }
`;

const EmailTemplates = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 12.5%;
  margin-right: ${dimensions.coreSpacing}px;
  transition: all ease 0.3s;

  > span {
    text-align: center;
    font-size: 12px;
    padding: ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px 0;
    color: ${colors.colorCoreGray};
    font-weight: 500;
  }

  &:hover {
    ${Options} {
      display: block;
    }
  }
`;

export {
  Actions,
  EmailTemplates,
  Options,
  TemplateBox,
  TemplatePreview,
  IframePreview
};
