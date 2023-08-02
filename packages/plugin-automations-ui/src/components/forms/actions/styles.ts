import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { dimensions, colors } from '@erxes/ui/src/styles';
import { TriggerBox } from '../../../styles';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { highlight } from '@erxes/ui/src/utils/animations';

export const ActionFooter = styled.div`
  padding: ${dimensions.unitSpacing}px;
  bottom: ${dimensions.coreSpacing}px;
`;

export const Attributes = styled.ul`
  list-style: none;
  margin: 0;
  right: 20px;
  max-height: 200px;
  min-width: 200px;
  overflow: auto;
  padding: ${dimensions.unitSpacing}px;
  border-radius: ${dimensions.unitSpacing - 5}px;

  > div {
    padding: 0;
  }

  b {
    margin-bottom: ${dimensions.unitSpacing + 10}px;
    color: black;
  }

  li {
    color: ${colors.colorCoreGray};
    padding-bottom: ${dimensions.unitSpacing - 5}px;
    cursor: pointer;
    font-weight: 400;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;

export const ActionBox = styledTS<{
  isFavourite: boolean;
  isAvailable: boolean;
}>(styled(TriggerBox))`
    flex-direction: row;
    margin-top: ${dimensions.unitSpacing}px;
    margin-right: 0;
    position: relative;
    pointer-events: ${props => !props.isAvailable && 'none'};

    > i {
      margin-right: ${dimensions.unitSpacing}px;
      background: ${rgba(colors.colorPrimary, 0.12)};
      border-radius: 4px;
      width: 45px;
      height: 45px;
      line-height: 45px;
      text-align: center;
      font-size: 22px;
      flex-shrink: 0;
      color: ${colors.textPrimary};
    }

    > div {
      b {
        color: ${colors.textPrimary};
      }
      p {
        margin: 0;
        max-width: 350px;
      }
      span {
        padding-left: ${dimensions.unitSpacing}px;
        color: ${colors.colorCoreOrange};
        font-weight: 500;
      }
    }

    .favourite-action {
      position: absolute;
      width: 30px;
      text-align: right;
      right: ${dimensions.coreSpacing}px;

      > i {
        color: ${props => props.isFavourite && colors.colorCoreOrange}
      }
    }
  `;

const Templates = styled.div`
  display: flex;
  background: ${colors.colorWhite};
  padding: ${dimensions.coreSpacing}px;
  overflow: auto;
`;

const IframePreview = styledTS<{
  height?: string;
  width?: string;
  pointerEvent?: string;
}>(styled.div)`
  width: 100%;
  height: 100%;
  overflow: hidden;

  iframe {
    ${({ pointerEvent }) =>
      pointerEvent
        ? `
    transform: scale(0.5);
    transform-origin: 0 -20px;
    pointer-events: {${({ pointerEvent }) => pointerEvent}};
    `
        : ''}
    width: ${({ width }) => (width ? width : '100%')};
    height: ${({ height }) => (height ? height : '300px')};
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
  padding: 10px 10px;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 6px;
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
  &.active {
    animation: ${highlight} 0.9s ease;
    box-shadow: 0 0 5px 0 #63d2d6;
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

export const TemplateWrapper = {
  Template,
  Actions,
  TemplateBox,
  Templates,
  IframePreview,
  TemplateInfo
};
