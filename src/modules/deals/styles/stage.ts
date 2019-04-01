import { colors } from 'modules/common/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { stageWidth } from './deminsions';

const hoverColor = 'rgba(10,45,65,.13)';
const stageGray = '#dee3e6';
const secondaryText = '#6a818c';

const Container = styledTS<{ isDragging: boolean }>(styled.div)`
  display: flex;
  flex-direction: column;
  margin: 0 4px;
  width: ${stageWidth}px;
  transition: background-color 0.3s ease;
  border-radius: 4px;
  ${props => css`
    box-shadow: ${props.isDragging
      ? `0 0 20px 2px rgba(0, 0, 0, 0.14)`
      : 'none'};
  `};
`;

const DealContainer = styled.div`
  overflow: auto;

  ul {
    float: left;
  }
`;

const Right = styled.div`
  float: right;
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

const Deal = styledTS<{ isDragging: boolean }>(styled.div)`
  margin-bottom: 10px;
  background-color: rgb(255, 255, 255);
  box-shadow: ${props =>
    props.isDragging
      ? 'rgba(0, 0, 0, 0.4) 0px 5px 15px 0px'
      : 'rgba(0, 0, 0, 0.2) 0px 1px 2px 0px'};
  overflow: hidden;
  padding: 8px;
  outline: 0px;
  font-size: 12px;
  border-radius: 3px;
  transition: box-shadow 0.3s ease-in-out 0s;
  -webkit-box-pack: justify;
  justify-content: space-between;
  will-change: transform;
`;

const Date = styled.div`
  color: rgb(136, 136, 136);
  font-size: 11px;
  z-index: 10;
  margin-left: 5px;
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

const DealIndicator = styledTS<{ color: string }>(styled.span)`
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 6px 6px 0 0;
  background-color: ${props => props.color}
`;

const Footer = styled.div`
  padding-top: 8px;
  margin-top: 8px;
  border-top: 1px dashed #ccc;
  font-size: 11px;
`;

const StageFooter = styled.div`
  background: ${stageGray};
  border-radius: 0 0 3px 3px;
`;

const Header = styled.div`
  padding: 10px 16px;
  position: relative;
  background: ${stageGray};
  border-radius: 3px 3px 0 0;

  h4 {
    margin: 0 0 5px;
    font-size: 14px;
    font-weight: bold;

    span {
      color: ${secondaryText};
      margin-left: 5px;
      font-size: 85%;
    }
  }
`;

const Amount = styled.ul`
  list-style: none;
  margin: 0;
  overflow: hidden;
  padding: 0;
  max-width: 230px;
  display: inline-block;

  li {
    float: left;
    padding-right: 5px;
    font-size: 12px;
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
  overflow: auto;
  background: ${stageGray};
`;

const AddNew = styled.a`
  display: block;
  color: ${secondaryText};
  padding: 8px 16px;
  position: relative;
  user-select: none;
  border-radius: 0 0 3px 3px;

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
  border-radius: 2px;
`;

const Wrapper = styledTS<{ isDraggingOver: boolean }>(styled.div)`
  background-color: ${({ isDraggingOver }) =>
    isDraggingOver && 'rgba(10, 45, 65, .1)'};
  display: flex;
  flex-direction: column;
  padding: 0 8px;
  transition: background-color 0.1s ease, opacity 0.1s ease;
  user-select: none;
`;

const DropZone = styled.div`
  min-height: 200px;
`;

const EmptyContainer = styled.div`
  height: 200px;
`;

export {
  AddNew,
  Container,
  DealContainer,
  Right,
  Content,
  Header,
  Amount,
  Body,
  Indicator,
  DealIndicator,
  IndicatorItem,
  StageFooter,
  Footer,
  Deal,
  Date,
  Wrapper,
  DropZone,
  EmptyContainer
};
