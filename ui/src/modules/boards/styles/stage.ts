import { PopoverList } from 'modules/common/components/filterableList/styles';
import { colors } from 'modules/common/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { stageWidth } from './common';

const hoverColor = 'rgba(10,45,65,.13)';
const stageGray = '#e5e8ec';
const secondaryText = '#6a818c';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 5px;
  width: ${stageWidth}px;
  will-change: scroll-position;
  transition: background-color 0.3s ease;
`;

const StageRoot = styledTS<{ isDragging: boolean }>(styled.div)`
  display: flex;
  flex-direction: column;
  background: ${stageGray};
  overflow: hidden;
`;

const Content = styledTS<{ type?: string }>(styled.div)`
  flex-grow: 1;
  flex-basis: 100%;
  display: flex;
  flex-direction: column;

  h5 {
    ${props => css`
      margin: ${props.type === 'growthHack' ? '0 20px 10px 0' : '0 0 8px 0'};
    `};
    word-break: break-word;
    line-height: 18px;
  }
`;

const Indicator = styledTS<{ isCardDragging: boolean }>(styled.div)`
  display: ${props => (props.isCardDragging ? 'none' : 'flex')};

  > div {
    margin-right: 4px;

    &:last-of-type {
      margin: 0;
    }
  }
`;

const ItemIndicator = styledTS<{ color: string }>(styled.span)`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 6px 6px 0 0;
  background-color: ${props => props.color};
  word-break:break-word;
`;

const StageFooter = styled.div``;

const Header = styled.div`
  padding: 12px 16px;
  position: relative;

  h4 {
    margin: 0;
    font-size: 14px;
    font-weight: bold;

    span {
      color: ${secondaryText};
      margin-left: 5px;
      font-size: 85%;
    }
  }
`;

const HeaderAmount = styled.div`
  min-height: 28px;
`;

const Amount = styled.ul`
  list-style: none;
  margin: 5px 0 0;
  overflow: hidden;
  padding: 0 !important;
  max-width: 230px;
  font-size: 12px;
  display: inline-block;

  li {
    float: left;
    padding-right: 5px;
    line-height: 22px;

    span {
      font-weight: bold;
      font-size: 10px;
    }

    &:after {
      content: '/';
      margin-left: 5px;
    }

    &:last-child:after {
      content: '';
    }
  }
`;

const Body = styled.div`
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  margin: 0 4px;

  &:hover {
    overflow-y: auto;
  }
`;

const AddNew = styled.a`
  display: block;
  color: ${secondaryText};
  padding: 8px 16px;
  position: relative;
  user-select: none;
  font-weight: 500;

  &:hover {
    background: ${hoverColor};
    cursor: pointer;
  }

  i {
    margin-right: 8px;
  }
`;

const IndicatorItem = styledTS<{ isPass: boolean }>(styled.div)`
  flex: 1;
  background: ${props => (props.isPass ? colors.colorCoreBlue : hoverColor)};
  height: 4px;
`;

const LoadingContent = styled.div`
  background: #fff;
  margin: 0 4px 8px 4px;
  padding: 2px 0;

  img {
    width: 100%;
  }
`;

export const StageTitle = styledTS<{ isDragging: boolean }>(styled.h4)`
  position: relative;
  display: ${props => (props.isDragging ? 'none' : 'flex')};
  justify-content: space-between;
`;

export const ActionList = styled(PopoverList)`
  min-width: 160px;
  li a {
    color: ${colors.textPrimary};
    text-transform: capitalize;
  }
`;

export const ActionButton = styled.div`
  padding: 4px 5px;
  margin-top: -4px;
  margin-right: -5px;
  font-size: 15px;
  &:hover {
    background: rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
`;

export {
  AddNew,
  Container,
  Content,
  Header,
  HeaderAmount,
  Amount,
  Body,
  Indicator,
  ItemIndicator,
  IndicatorItem,
  StageFooter,
  LoadingContent,
  StageRoot
};
