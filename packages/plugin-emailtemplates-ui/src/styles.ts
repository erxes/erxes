import { colors, dimensions } from '@erxes/ui/src/styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Templates = styled.div`
  display: flex;
  background: ${colors.colorWhite};
  padding: ${dimensions.coreSpacing}px;
  overflow: auto;
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

const TemplateBox = styled.div`
  width: 100%;
  height: 140px;
  border-radius: 2px;
  border: 1px solid ${colors.borderDarker};
  position: relative;
  margin: 10px 0 15px 0;
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

    &:hover {
      font-weight: 500;
      transition: all ease 0.3s;
    }
  }
`;

const Template = styledTS<{ isLongName?: boolean }>(styled.div)`
  flex-basis: 300px;
  padding: 10px 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 6px;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px 0;
  box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.1);

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
    ${Actions} {
      opacity: 1;
    }
  }
`;

const TemplateInfo = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;

  > p {
    color: ${colors.colorCoreGray};
    line-height: 12px;
    margin: 0 0 5px;

    &:first-child {
      color: #333;
    }
  }
`;

export {
  Template,
  Actions,
  TemplateBox,
  Templates,
  IframePreview,
  TemplateInfo
};
