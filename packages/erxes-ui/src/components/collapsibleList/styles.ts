import { colors, dimensions } from '../../styles';

import { ActionButtons } from '@erxes/ui-settings/src/styles';
import { lighten } from '@erxes/ui/src/styles/ecolor';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child li {
    margin-bottom: 0;
  }
`;

const AvatarImg = styled.img`
  width: ${dimensions.coreSpacing + 6}px;
  height: ${dimensions.coreSpacing + 6}px;
  line-height: ${dimensions.coreSpacing + 6}px;
  border-radius: ${(dimensions.coreSpacing + 6) / 2}px;
  vertical-align: middle;
  background: ${colors.bgActive};
  margin-right: ${dimensions.unitSpacing}px;
`;

const ToggleIcon = styledTS<{ isIndented?: boolean; type?: string }>(
  styled.div
)`
  margin-left: -${dimensions.unitSpacing - 5}px;
  
  i {
    &:before {
      display:block
    }
  }
`;

const ItemText = styled.span`
  flex: 1;
  width: 100%;
`;

const CollapsibleListWrapper = styled.div`
  ul {
    padding: 0 !important;

    > .child {
      padding-left: ${dimensions.coreSpacing - 5}px;
    }
  }

  .product-count {
    position: absolute;
    right: ${dimensions.coreSpacing}px;
  }
`;

const SidebarListItem = styledTS<{
  isActive: boolean;
  backgroundColor?: string;
}>(styled.li)`
  position: relative;
  background: ${props =>
    (props.isActive && rgba(colors.colorPrimary, 0.2)) ||
    props.backgroundColor ||
    colors.colorWhite};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  white-space: normal;
  padding: ${dimensions.unitSpacing - 2}px 0 ${dimensions.unitSpacing - 2}px ${
  dimensions.coreSpacing
}px;

  span, i {
    color: ${props => props.isActive && colors.colorPrimary} !important;
  }
  
  a {
    white-space: normal;
    flex: 1;
    padding: 0;
    color: ${props => props.isActive && colors.colorPrimary} !important;
    font-weight: ${props => (props.isActive ? 500 : 400)};

    &:hover {
      background: none;
      color: ${props => !props.isActive && lighten(colors.textPrimary, 40)};
    }

    &:focus {
      text-decoration: none;
    }

    > span {
      color: #666;
      font-weight: normal;
    }
  }

  .list-icon {
    margin-right: ${dimensions.unitSpacing - 5}px;
    color: ${colors.colorCoreBlue};
  }

  &:last-child {
    border: none;
  }
  
  &:hover {
    cursor: pointer;
    background: ${props => !props.isActive && colors.bgLight};
    
    ${ActionButtons} {
      width: 60px;
      z-index: 1;
      background: ${props => (props.isActive ? '#e2dcf2' : colors.bgLight)};
    }
  }
`;

export {
  FlexRow,
  AvatarImg,
  ToggleIcon,
  CollapsibleListWrapper,
  ItemText,
  SidebarListItem
};
