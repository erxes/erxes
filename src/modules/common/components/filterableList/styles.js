import styled from 'styled-components';
import { colors } from '../../styles';

const PopoverHeader = styled.div`
  padding: 10px;
  display: block !important;

  input {
    margin-bottom: 0;
  }
`;

const PopoverBody = styled.div`
  min-width: 260px;
`;

const PopoverList = styled.ul`
  max-height: 275px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow: auto;
  padding-bottom: 10px;

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
      margin-right: 5px;
    }

    &:hover {
      background: #f8f8f8;
      cursor: pointer;
    }

    &:before {
      font-family: Ionicons;
      font-size: 10px;
      width: 15px;
      height: 15px;
      z-index: 30;
      text-align: center;
      position: absolute;
      color: ${colors.colorCoreDarkGray};
      top: 50%;
      left: 10px;
      margin-top: -7px;
    }

    &.all:before {
      content: '\f121';
    }
  }
`;

const PopoverFooter = styled.div`
  padding: 5px 0;
  border-top: 1px solid #eee;

  ${PopoverList} {
    padding-bottom: 0;
  }

  a {
    color: ${colors.colorCoreGray};
    display: block;
  }
`;

const AvatarImg = styled.img`
  width: 30px;
  height: 30px;
  line-height: 30px;
  border-radius: 30px;
  font-size: 10px;
  vertical-align: middle;
  margin-right: 5px;
`;

export { PopoverHeader, PopoverBody, PopoverList, PopoverFooter, AvatarImg };
