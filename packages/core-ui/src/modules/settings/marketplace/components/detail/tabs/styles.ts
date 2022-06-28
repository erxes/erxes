import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';

const TabContainer = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-shrink: 0;
  height: ${dimensions.headerSpacing}px;
  margin: ${dimensions.unitSpacing}px 0;
`;

const TabCaption = styledTS<{ active?: boolean }>(styled.div)`
  cursor: pointer;
  display: inline-block;
  color: ${props => props.active && colors.colorPrimary};
  font-weight: bold;
  margin: 15px 0;
  padding: 0 ${dimensions.coreSpacing}px;
  position: relative;
  transition: all ease 0.3s;
  border-right: 2px solid ${colors.textPrimary};

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    border: none;
  }

  &:hover {
    color: ${colors.colorPrimary};
  }

  i {
    margin-right: 3px;
  }

  &.active {
    color: ${colors.colorPrimary};
    font-weight: 500;
    &:before {
      border-bottom: 3px solid ${colors.colorSecondary};
      content: '';
      width: 100%;
      position: absolute;
      z-index: 1;
      left: 0;
      bottom: -1px;
    }
  }
`;

export { TabContainer, TabCaption };
