import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '../../styles';

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
    display: flex !important;
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
        margin-right: ${dimensions.unitSpacing}px;
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

const ToggleIcon = styledTS<{ isIndented?: boolean; type?: string }>(
  styled.div
)`
  position: absolute;
  ${props =>
    props.type === 'list' &&
    `
  top: 8px;
  left:${
    props.isIndented
      ? `${dimensions.unitSpacing * 0.5}px`
      : `${dimensions.unitSpacing * 1.5}px`
  };
  line-height: ${iconWidth}px;
  text-align: center;
  width: ${iconWidth / 2}px;`}
  height: ${iconWidth}px;
  cursor: pointer;
  z-index: 1;
  ${props =>
    props.type === 'params' &&
    `
  display: flex;
  align-items: center;`};

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

const ItemText = styled.span`
  flex: 1;
  width: 100%;
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
  ItemText
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
  ItemText
};
