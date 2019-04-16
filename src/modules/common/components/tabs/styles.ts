import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions, typography } from '../../styles';

const TabContainer = styledTS<{ grayBorder?: boolean; full?: boolean }>(
  styled.div
)`
  border-bottom: 1px solid
    ${props => (props.grayBorder ? colors.borderDarker : colors.borderPrimary)};
  margin-bottom: -1px;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: ${props => props.full && 'space-evenly'};
  flex-shrink: 0;
  height: ${dimensions.headerSpacing}px;
`;

const TabCaption = styled.span`
  cursor: pointer;
  display: inline-block;
  color: ${colors.textSecondary};
  font-weight: ${typography.fontWeightRegular};
  padding: 15px ${dimensions.coreSpacing}px;
  position: relative;
  transition: all ease 0.3s;

  &:hover {
    color: ${colors.textPrimary};
  }

  i {
    margin-right: 3px;
  }

  &.active {
    color: ${colors.textPrimary};
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
