import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';

const TabContainer = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-shrink: 0;
  height: ${dimensions.headerSpacing}px;
  margin: ${dimensions.coreSpacing}px 0;
  border-bottom: 1px solid ${colors.borderDarker};
`;

const TabCaption = styledTS<{ active?: boolean }>(styled.div)`
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${props => props.active && colors.colorPrimary};
  font-weight: bold;
  padding: 0 ${dimensions.coreSpacing}px;
  position: relative;
  border-radius: 5px 5px 0px 0px;
  border: ${props => props.active && `1px solid ${colors.borderDarker}`};
  border-bottom: ${props => props.active && 0};
  padding-bottom: 1px;
  margin-bottom: -1px;
  
  background-color: ${props => props.active && colors.colorWhite};

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
