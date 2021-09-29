import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import dimensions from './dimensions';
import colors from './colors';

const PopoverHeader = styled.div`
  display: block !important;

  input {
    margin-bottom: 0;
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  }
`;

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child li {
    margin-bottom: 0;
  }

  > li {
    flex: 1;
  }
`;

const IconWrapper = styled.div`
  cursor: pointer;
  height: 28px;
  width: 28px;
  text-align: center;
  transition: all ease 0.3s;

  > i:hover {
    opacity: 0.7;
  }
`;

const PopoverList = styledTS<{ selectable?: boolean; isIndented?: boolean }>(
  styled.ul
)`
  max-height: 275px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: auto;
  padding-bottom: 10px;
  padding-top: 10px;
  text-indent:${props =>
    props.isIndented && `-${dimensions.unitSpacing + 5}px`};
  margin-left: ${props => props.isIndented && `${dimensions.unitSpacing}px`};

  li {
    position: relative;
    display: block;
    overflow: hidden;
    padding: ${dimensions.unitSpacing / 2}px ${props =>
  props.isIndented
    ? `${dimensions.unitSpacing * 3 + 7}px`
    : `${dimensions.unitSpacing * 2}px`}; 
    white-space: normal;
    font-size: 13px;
    padding-right: ${props => props.selectable && '30px'};

    i {
      &.icon-tag-alt{
        margin-right: ${dimensions.unitSpacing / 5}px;
      }
    }

    &:hover {
      background: ${colors.bgLight};
      cursor: pointer;
    }

    &:before {
      font-family: 'erxes';
      font-size: 12px;
      width: 15px;
      height: 15px;
      z-index: 30;
      text-align: center;
      position: absolute;
      color: ${colors.colorCoreDarkGray};
      top: ${dimensions.headerSpacing}%;
      right: ${props =>
        props.isIndented
          ? `${dimensions.unitSpacing * 0.5}px`
          : `${dimensions.unitSpacing * 1.5}px`};
      margin-top: -${dimensions.unitSpacing - 1}px;
    }

    &.all:before {
      content: '\\ea3f';
    }

    &.some:before {
      content: '\\ebe8';
    }
  }
`;

const PopoverBody = styled.div`
  ${PopoverList} {
    max-height: 275px;
    overflow: auto;
  }

  ul {
    overflow: unset;
    max-height: unset;
  }

  min-width: 260px;
`;

const PopoverFooter = styled.div`
  padding: 5px 0;
  border-top: 1px solid #eee;

  ${PopoverList} {
    padding-bottom: 0;
    padding-top: 0;
    margin-top: 0;
  }

  a {
    color: ${colors.colorCoreGray};
    display: block;
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

const ChildList = styled.div`
  list-style: none;
  position: relative;
  padding: 0 0 0 20px !important;
`;

const iconWidth = 30;

const ToggleIcon = styledTS<{ isIndented?: boolean }>(styled.div)`
  position: absolute;
  left:${props =>
    props.isIndented
      ? `${dimensions.unitSpacing * 0.5}px`
      : `${dimensions.unitSpacing * 1.5}px`};
  width: ${iconWidth / 2}px;
  height: ${iconWidth}px;
  line-height: ${iconWidth}px;
  text-align: center;
  cursor: pointer;
  z-index: 1;

  i {
    &:before {
      display:block
    }
  }
`;

const PopoverContent = styled.div`
  > input {
    padding: ${dimensions.unitSpacing}px ${dimensions.unitSpacing * 2}px;
  }
`;

const SidebarList = styledTS<{ capitalize?: boolean }>(styled.ul)`
  margin: 0;
  padding: 0;
  list-style: none;

  li.child-segment {
    border-bottom: none;
    background-color: ${colors.bgLight};

    > span {
      background-color: ${colors.bgLight};
      box-shadow: -2px 0 10px 2px ${colors.bgLight};
    }
  }

  &.no-link li,
  a {
    display: flex;
    padding: 6px 20px;
    color: ${colors.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-decoration: none;
    text-transform: ${props => (props.capitalize ? 'capitalize' : 'normal')};
    outline: 0;
    border-left: 2px solid transparent;
    transition: background 0.3s ease;

    > i {
      margin-right: 5px;
    }

    &:hover,
    &.active {
      cursor: pointer;
      background: ${colors.bgActive};
      text-decoration: none;
      outline: 0;
      color: ${colors.textPrimary};
    }

    &.active {
      border-left: 2px solid ${colors.colorSecondary};
    }

    &.multiple-choice {
      flex-wrap: wrap;
      justify-content: space-between;
      white-space: normal;

    }
  }

  .icon {
    margin-right: 6px;
    color: ${colors.colorCoreGray};
  }

  button {
    font-size: 11px;
    padding-bottom: 0;
  }
`;

const GroupTitle = styledTS<{ isOpen?: boolean }>(styled.div)`
  font-weight: bold;
  line-height: 32px;
  padding: 0 20px;
  color: ${props => props.isOpen && colors.colorSecondary};
  user-select: none;
  transition: color ease 0.3s;
  display: flex;
  justify-content: space-between;

  a {
    color: ${colors.colorCoreGray};

    &:hover {
      color: ${colors.colorCoreBlack};
    }
  }

  span i {
    margin-left: 5px;
    margin-right: 0;
    display: inline-block;
    transition: all ease 0.3s;
    transform: ${props => props.isOpen && 'rotate(180deg)'};
  }

  > span:hover {
    cursor: pointer;
  }
`;

const PopoverButton = styled.div`
  display: inline-block;
  position: relative;

  > * {
    display: inline-block;
  }

  > i {
    margin-left: 3px;
    margin-right: -4px;
    transition: all ease 0.3s;
    color: ${colors.colorCoreGray};
  }

  &:hover {
    cursor: pointer;
  }
`;
export {
  PopoverHeader,
  PopoverBody,
  PopoverList,
  PopoverFooter,
  PopoverContent,
  FlexRow,
  AvatarImg,
  IconWrapper,
  ChildList,
  ToggleIcon,
  SidebarList,
  GroupTitle,
  PopoverButton
};

export default {
  PopoverHeader,
  PopoverBody,
  PopoverList,
  PopoverFooter,
  PopoverContent,
  FlexRow,
  AvatarImg,
  IconWrapper,
  ChildList,
  ToggleIcon,
  SidebarList,
  GroupTitle,
  PopoverButton
};
