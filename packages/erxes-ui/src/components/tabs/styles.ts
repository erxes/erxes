import { colors, dimensions, typography } from '../../styles';

import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const TabContainer = styledTS<{ $grayBorder?: boolean; $full?: boolean; $direction?: string; }>(
  styled.div,
)`
  border-bottom: 1px solid
    ${(props) => (props.$grayBorder ? colors.borderDarker : colors.borderPrimary)};
  margin-bottom: -1px;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: ${props => props.$direction === "vertical" ? "column" : "row"};
  justify-content: ${(props) => props.$full && 'space-evenly'};
  flex-shrink: 0;
  height: ${props => props.$direction === "vertical" ? '100% !important' : `${dimensions.headerSpacing}px`};
`;

const TabCaption = styledTS<{ direction?: string; }>(styled.span)`
  cursor: pointer;
  display: flex;
  flex-direction: ${props => props.direction === "vertical" ? "column" : "row"};
  color: ${colors.textSecondary};
  font-weight: ${typography.fontWeightRegular};
  padding: 15px ${dimensions.coreSpacing}px;
  position: relative;
  transition: all ease 0.3s;
  line-height: 18px;
  text-align: center;
  align-items: center;
  font-size: ${props => props.direction === "vertical" && "12px"};

  &:hover {
    color: ${colors.textPrimary};
  }

  i {
    margin-right: 3px;
  }

  &.compact {
    padding: 15px;
  }

  &.active {
    color: ${colors.textPrimary};
    font-weight: 500;

    &:before {
      border-bottom: ${props => props.direction !== "vertical" && `3px solid ${colors.colorSecondary}`};
      border-left: ${props => props.direction === "vertical" && `3px solid ${colors.colorSecondary}`};
      content: '';
      width: 100%;
      height: ${props => props.direction === "vertical" && `100%`};
      position: absolute;
      z-index: 1;
      left: 0;
      bottom: -1px;
    }
  }
`;

export { TabContainer, TabCaption };
