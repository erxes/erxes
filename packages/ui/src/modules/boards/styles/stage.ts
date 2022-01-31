import { PopoverList } from 'modules/common/components/filterableList/styles';
import { colors, dimensions } from 'modules/common/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { borderRadius, stageWidth } from './common';

const hoverColor = 'rgba(10,45,65,.13)';
const stageGray = '#e5e8ec';
const secondaryText = '#6a818c';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 5px;
  width: ${stageWidth}px;
  transition: background-color 0.3s ease;
`;

const StageRoot = styledTS<{ isDragging: boolean }>(styled.div)`
  display: flex;
  flex-direction: column;
  border-radius: 3px;
  transition: box-shadow 0.3s ease;
  background: ${stageGray};
  overflow: hidden;
  ${props => css`
    box-shadow: ${props.isDragging
      ? 'rgba(0, 0, 0, 0.2) 0px 5px 20px 0px'
      : 'rgba(0, 0, 0, 0.15) 0px 1px 5px 0px'};
  `};
`;

const Content = styledTS<{ type?: string }>(styled.div)`
  h5 {
    ${props => css`
      margin: ${props.type === 'growthHack' ? '0 20px 10px 0' : '0 20px 8px 0'};
    `};
    word-break: break-word;
    line-height: 18px;
  }
`;

const Indicator = styled.div`
  display: flex;
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
  border-radius: 4px;
  margin: 6px 6px 0 0;
  background-color: ${props => props.color};
  word-break:break-word;
`;

const StageFooter = styled.div`
  border-radius: 0 0 3px 3px;
`;

const Header = styled.div`
  padding: 12px 16px;
  position: relative;
  border-radius: 3px 3px 0 0;
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

const Body = styled.div`
  max-height: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  margin: 0 4px;
  &:hover {
    overflow-y: auto;
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
const ListContainer = styled.div`
  border: 1px solid rgb(238, 238, 238);
  border-radius: ${dimensions.unitSpacing - 4}px;
  margin: ${dimensions.coreSpacing}px ${dimensions.unitSpacing}px;
  transition: background-color 0.3s ease;
  box-shadow: 0px 0px 20px 2px rgb(0 0 0 / 10%);
`;

export const ListBody = styled.div`
  overflow: auto;
  position: relative;
  overflow-y: overlay;
  max-height: 300px;
`;

export const Footer = styled.div`
  background: rgb(250, 250, 250);
  border-top: 1px solid rgb(238, 238, 238);
  display: flex;
  -webkit-box-pack: justify;
  justify-content: space-between;
`;

export const ListStageFooter = styled.div`
  border-radius: 0 0 3px 3px;
  background: rgba(101, 105, 223, 0.15);
  align-self: center;
  margin-left: auto;
  width: 200px;
`;

const AddNew = styled.a`
  display: block;
  color: ${secondaryText};
  padding: 8px 16px;
  position: relative;
  user-select: none;
  border-radius: 0 0 3px 3px;
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
  border-radius: ${borderRadius};
`;

const LoadingContent = styled.div`
  background: #fff;
  margin: 0 4px 8px 4px;
  padding: 2px 0;
  border-radius: ${borderRadius};
  box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
  img {
    width: 100%;
  }
`;

export const StageTitle = styled.h4`
  position: relative;
  display: flex;
  justify-content: space-between;
`;

export const GroupTitle = styled.div`
  display: flex;

  span {
    border-radius: 14px;
    padding: ${dimensions.unitSpacing - 8}px ${dimensions.unitSpacing - 1}px;
    background: rgba(101, 105, 223, 0.15);
  }
`;

export const ColumnLastChild = styled.th`
  &:last-child {
    text-align: left !important;
  }
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
  border-radius: 2px;
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
  StageRoot,
  ListContainer
};
