import { colors, dimensions } from '@erxes/ui/src';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styledTS from 'styled-components-ts';

import styled from 'styled-components';

export const Trigger = styledTS<{ type: string; isHoverActionBar?: boolean }>(
  styled.div
)`
  max-width: 300px;
  padding: 3px;
  background: #f5f5f5;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 8px;
  cursor: pointer;

  > p {
    font-size: 13px;
    text-align: center;
    margin: 0;
    padding: ${dimensions.unitSpacing + 5}px ${dimensions.unitSpacing}px;
    color: ${colors.colorCoreGray};
  }

  .header {
    background: ${props =>
      props.type === 'trigger'
        ? rgba(colors.colorPrimary, 0.12)
        : rgba(colors.colorCoreOrange, 0.12)};
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
        color: ${props =>
          props.type === 'trigger'
            ? colors.colorSecondary
            : `${colors.colorCoreOrange} !important`};
      }
    }

    .custom-menu {
      position: absolute;
      right: 0;
      margin: 0;
      top: ${({ isHoverActionBar }) =>
        isHoverActionBar ? '-28' : dimensions.unitSpacing}px;
      visibility: ${({ isHoverActionBar }) =>
        isHoverActionBar ? 'visible' : 'hidden'};
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


      > li {
        position: relative;
        list-style-type: none;
        background-color:#f5f5f5
        
        border-radius: 5px;
        margin:5px;
        padding: 5px;
        color: ${colors.colorCoreGray};
      }
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
