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

const PopoverBody = styled.div`
  min-width: 260px;
`;

const PopoverList = styledTS<{ selectable?: boolean }>(styled.ul)`
  max-height: 275px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: auto;
  padding-bottom: 10px;
  padding-top: 10px;

  li {
    position: relative;
    display: block;
    overflow: hidden;
    padding: 5px 20px;
    white-space: nowrap;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;
    font-size: 13px;
    padding-left: ${props => props.selectable && '30px'};

    i {
      margin-right: ${dimensions.unitSpacing / 2}px;
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
      left: ${dimensions.unitSpacing}px;
      margin-top: -7px;
    }

    &.all:before {
      content: '\\ea3f';
    }

    &.some:before {
      content: '\\ebe8';
    }
  }
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

export { PopoverHeader, PopoverBody, PopoverList, PopoverFooter, AvatarImg };
