import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';

const Templates = styled.div`
  height: 100%;
  background: ${colors.colorWhite};
  padding: ${dimensions.coreSpacing}px;
  overflow: auto;
  display: flex;
`;

const IframePreview = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;

  iframe {
    transform: scale(0.5);
    transform-origin: 0 -20px;
    pointer-events: none;
    width: 200%;
    height: 300px;
    border: 0;
  }
`;

const TemplateBox = styled.div`
  width: 100%;
  height: 140px;
  border-radius: 2px;
  border: 1px solid ${colors.borderDarker};
  position: relative;
`;

const Actions = styled.div`
  background: ${rgba(colors.colorBlack, 0.7)};
  display: flex;
  position: absolute;
  opacity: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  border-radius: 2px;
  transition: opacity ease 0.3s;
  justify-content: space-evenly;
  align-items: center;
  color: ${colors.bgLight};

  div {
    cursor: pointer;

    i {
      margin-right: 3px;
    }
  }
`;

const Template = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 18%;
  float: left;
  margin-right: ${dimensions.coreSpacing}px;

  > h5 {
    text-align: center;
    line-height: ${dimensions.coreSpacing}px;
    margin: ${dimensions.unitSpacing}px 0;
    color: ${colors.colorCoreGray};
    width: 100%;
    height: ${dimensions.coreSpacing * 2}px;
    overflow: hidden;
    font-weight: normal;
  }

  &:hover {
    ${Actions} {
      opacity: 1;
    }
  }
`;

export { Template, Actions, TemplateBox, Templates, IframePreview };
