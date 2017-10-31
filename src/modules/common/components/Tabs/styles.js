import styled from 'styled-components';
import { colors, typography, dimensions } from '../../styles';

const TabContainer = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  margin-bottom: ${dimensions.coreSpacing}px;
`;

const TabCaption = styled.span`
  cursor: pointer;
  display: inline-block;
  color: ${colors.textSecondary};
  font-weight: ${typography.fontWeightLight};
  padding: calc(${dimensions.coreSpacing}px * 0.6) ${dimensions.coreSpacing}px;
  position: relative;
  transition: color 0.3s ease;

  &:hover {
    color: ${colors.textPrimary};
  }

  &.active {
    color: ${colors.textPrimary};

    &:before {
      border-bottom: 3px solid ${colors.colorSecondary};
      content: '';
      content: '';
      width: 100%;
      position: absolute;
      z-index: 1;
      left: 0;
      bottom: -2px;
    }
  }
`;

export { TabContainer, TabCaption };
