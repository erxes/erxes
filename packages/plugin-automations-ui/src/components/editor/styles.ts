import { colors, dimensions } from '@erxes/ui/src';

import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const getNodeHeaderColor = (type: 'trigger' | 'action' | 'workflow') => {
  switch (type) {
    case 'trigger':
      return rgba(colors.colorPrimary, 0.12);
    case 'workflow':
      return rgba('#DCDCDC', 0.5);
    default:
      return rgba(colors.colorCoreOrange, 0.12);
  }
};

const getNodeIconColor = (type: 'trigger' | 'action' | 'workflow') => {
  switch (type) {
    case 'trigger':
      return colors.colorSecondary;
    case 'workflow':
      return '#838383';
    default:
      return `${colors.colorCoreOrange} !important`;
  }
};

export const Trigger = styledTS<{
  type: 'trigger' | 'action' | 'workflow';
  $isHoverActionBar?: boolean;
  $isSelected?: boolean;
}>(styled.div)`
  max-width: 300px;
  padding: 3px;
  background: #f5f5f5;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;
  cursor: pointer;

  ${({ $isSelected }) =>
    $isSelected
      ? `
      border: 2px dashed ${colors.colorSecondary} ;
      
    `
      : `
        border: 1px solid ${colors.borderPrimary};
      `}

  > p {
    font-size: 13px;
    text-align: center;
    margin: 0;
    padding: ${dimensions.unitSpacing + 5}px ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreGray};
  }

  .header {
    background: ${props => getNodeHeaderColor(props.type)};
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;
    font-weight: 500;
    font-size: 14px;
    padding: ${dimensions.unitSpacing}px;

    > div {
      display: flex;
      align-items: center;
      margin-right: ${dimensions.coreSpacing}px;

      > i {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        font-size: 24px;
        line-height: 40px;
        text-align: center;
        flex-shrink: 0;
        margin-right: ${dimensions.unitSpacing}px;
        background: ${colors.colorWhite};
        color: ${props => getNodeIconColor(props.type)};
      }
    }

    .custom-menu {
      position: absolute;
      right: 0;
      margin: 0;
      top: ${({ $isHoverActionBar }) =>
        $isHoverActionBar ? '-28' : dimensions.unitSpacing}px;
      visibility: ${({ $isHoverActionBar }) =>
        $isHoverActionBar ? 'visible' : 'hidden'};
      transition: all 0.2s linear;

      i {
        background: #e3deee;
        margin-left: ${dimensions.unitSpacing - 5}px;
        padding: ${dimensions.unitSpacing - 5}px;
        border-radius: 50%;
        color: ${colors.colorSecondary};
        cursor: pointer;
        border: 1px solid ${colors.colorSecondary};
        transition: transform 0.5s;
        transform: scale(1.5);

        &.note {
          background: ${rgba(colors.colorSecondary, 0.12)};
          color: ${colors.colorSecondary};
          border: 1px solid ${colors.colorSecondary};
        }

        &.delete-control {
          background: #ffe4e7;
          color: ${colors.colorCoreRed};
          border: 1px solid ${colors.colorCoreRed};
        }

        &:hover {
          box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.4);
        }
      }
    }
  }

  .optional-connects:empty {
    display: none;
  }

  .optional-connects {
    background-color:${props =>
      props.type === 'trigger'
        ? rgba(colors.colorPrimary, 0.12)
        : rgba(colors.colorCoreOrange, 0.12)};
    border-radius: 5px;

    padding: 5px;
    margin-top: 5px;


      .optional-connect {
        position: relative;
        list-style-type: none;
        background-color:#FFF;
        box-shadow:1px 1px 3px 1px rgb(0 0 0 / 2%);
        font-size:x-small;
        font-weight:500;
        
        border-radius: 5px;
        margin:5px;
        padding: 5px;
      }
  }

  .triggerContent:empty {
    display: none;
  }

  .triggerContent {
    background-color:${rgba(colors.colorPrimary, 0.12)};
    border-radius: 5px;

    padding: 5px;
    margin-top: 5px;
   }
`;

export const ScratchNode = styled.div`
  max-width: 300px;
  padding: 3px;
  background: #f5f5f5;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;
  cursor: pointer;
  top: 40%;
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 20px 10px 10px;
  transition: all ease 0.3s;

  > i {
    width: 40px;
    height: 40px;
    line-height: 40px;
    background: ${rgba(colors.colorSecondary, 0.12)};
    border-radius: 40px;
    color: ${colors.colorSecondary};
    text-align: center;
  }

  > p {
    font-size: 12px;
    text-align: center;
    margin: 0;
    padding: ${dimensions.unitSpacing + 5}px ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreGray};
  }

  :hover {
    border-color: ${colors.colorSecondary};
    transition: all ease 0.3s;
  }
`;

export const ActionContent = styled.div`
  position: absolute;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #ddd;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 2px;
`;

export const EdgeButton = styled.button`
  width: 20px;
  height: 20px;
  background: ${colors.colorSecondary};
  color: white;
  border: 1px solid #fff;
  cursor: pointer;
  border-radius: 50%;
  font-size: 12px;
  line-height: 1;

  &:hover {
    box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.08);
  }
`;

export const NodeStatusTrigger = styledTS<{ error?: boolean }>(styled.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: ${({ error }) => (error ? colors.colorCoreRed : colors.colorCoreGreen)};
  color: white;
  border: 1px solid #fff;
  cursor: pointer;
  border-radius: 50%;
  font-size: 12px;
  line-height: 1;
`;
