import { colors } from 'modules/common/styles';
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

  ${props => css`
    box-shadow: ${props.isDragging
      ? 'rgba(0, 0, 0, 0.2) 0px 5px 20px 0px'
      : 'rgba(0, 0, 0, 0.15) 0px 1px 5px 0px'};
  `};
`;

const Content = styled('div')`
  flex-grow: 1;
  flex-basis: 100%;
  display: flex;
  flex-direction: column;

  h5 {
    margin-top: 0;
    margin-bottom: 5px;
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
  background-color: ${props => props.color}
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
  overflow-y: auto;
  margin: 0 4px;
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
