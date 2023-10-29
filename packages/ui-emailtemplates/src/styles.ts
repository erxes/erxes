import { colors, dimensions } from '@erxes/ui/src/styles';

import { highlight } from '@erxes/ui/src/utils/animations';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Templates = styled.div`
  display: flex;
  background: ${colors.colorWhite};
  padding: 20px 0 20px 20px;
  flex-wrap: wrap;

  > div {
    flex-basis: 50%;
    display: flex;
    flex-shrink: 0;

    @media (min-width: 480px) {
      flex-basis: 97%;
    }

    @media (min-width: 768px) {
      flex-basis: 34%;
    }

    @media (min-width: 1170px) {
      flex-basis: 31%;
    }

    @media (min-width: 1400px) {
      flex-basis: 23.4%;
    }
  }
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

const IframeFullScreen = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;

  iframe {
    width: 100%;
    height: 800px;
    border: 0;
  }
`;

const TemplateWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  overflow: auto;
  padding: 5px;
  justify-content: center;
  > div {
    min-width: 440px;
  }
`;

const TemplateBox = styledTS<{ hasPadding?: boolean }>(styled.div)`
  width: 100%;
  height: 140px;
  border-bottom: 1px solid #F1F1F2;
  position: relative;
  padding: ${props => props.hasPadding && `${dimensions.unitSpacing}px`};
`;

const Actions = styled.div`
  background: ${rgba(colors.colorBlack, 0.7)};
  background-image: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.4) 0px,
    transparent 80px
  );
  display: flex;
  position: absolute;
  opacity: 0;
  z-index: 3;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  border-radius: 2px;
  transition: opacity ease 0.4s;
  justify-content: space-evenly;
  align-items: center;
  color: ${colors.bgLight};

  div {
    cursor: pointer;
    color: ${colors.colorWhite};
    opacity: 0.8;
    transition: all ease 0.3s;

    i {
      margin-right: 3px;
    }

    &:hover {
      opacity: 1;
    }
  }
`;

const Template = styledTS<{ isLongName?: boolean; position?: string }>(
  styled.div
)`
  flex-basis: 300px;
  display: flex;
  flex-direction: column;
  justify-content: ${props => props.position || 'space-between'};
  border-radius: 6px;
  border: 1px solid #F1F1F2;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.03);

  > h5 {
    line-height: ${dimensions.coreSpacing}px;
    margin: 0;
    color: ${colors.textPrimary};
    width: 100%;
    height: ${dimensions.coreSpacing * 2}px;
    overflow: hidden;
    font-weight: normal;
    display: ${props => !props.isLongName && 'flex'};
    align-items: ${props => !props.isLongName && 'center'};
    font-weight: 500;
    font-size: 15px;
  }

  &:hover {
    box-shadow: 0px 8px 12px 0px rgba(0, 0, 0, 0.08);

    ${Actions} {
      opacity: 1;
    }
  }

  &.active {
    animation: ${highlight} 0.9s ease;
    box-shadow: 0 0 5px 0 #63d2d6;
  }
`;

const TemplateInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: ${dimensions.unitSpacing}px;

  > p {
    color: ${colors.colorCoreGray};
    line-height: 12px;
    margin: 0;

    &.flex {
      display: flex;
    }

    &:first-child {
      color: #333;
      margin-right: ${dimensions.coreSpacing}px;
      min-width: 100px;
      display: flex;
    }

    &:last-child {
      text-align: end;
    }
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const TemplateBoxInfo = styled.div`
  padding: ${dimensions.unitSpacing}px;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;

  > h5 {
    margin: 0 0 ${dimensions.unitSpacing}px;
  }
`;

const EllipsedRow = styled.div`
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
`;

export {
  Template,
  Actions,
  TemplateBox,
  Templates,
  IframePreview,
  IframeFullScreen,
  TemplateInfo,
  TemplateWrapper,
  TemplateBoxInfo,
  EllipsedRow
};
