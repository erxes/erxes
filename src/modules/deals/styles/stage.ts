import { colors } from 'modules/common/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { borderRadius, stageHeight, stageWidth } from './deminsions';

const Header = styled.div`
  padding: 8px 16px;
  position: relative;
  min-height: 70px;

  h3 {
    margin: 0;
    font-size: 11px;
    line-height: inherit;
    text-transform: uppercase;
    font-weight: bold;

    span {
      color: ${colors.colorCoreGray};
      margin-left: 5px;
      font-size: 90%;
    }
  }
`;

const Headers = styledTS<{ isDragging: boolean }>(styled.div)`
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  background-color: ${({ isDragging }) =>
    isDragging ? colors.colorCoreGray : colors.colorCoreLightGray};
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${colors.colorCoreLightGray};
  }

`;

const Container = styledTS<{ isDragging: boolean }>(styled.div)`
  display: flex;
  flex-direction: column;
  margin: 0 4px;
  width: ${stageWidth}px;
  transition: background-color 0.3s ease;
  border-radius: 4px;
  ${props => css`
    background: ${props.isDragging && colors.colorWhite};
    box-shadow: ${props.isDragging
      ? `0 0 20px 2px rgba(0, 0, 0, 0.14)`
      : 'none'};
  `};
`;

const Amount = styled.ul`
  list-style: none;
  margin: 5px 0px 0px;
  overflow: hidden;
  padding: 0;
  max-width: 230px;
  display: inline-block;

  li {
    float: left;
    padding-right: 5px;
    font-size: 12px;

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
  overflow-y: auto;
`;

const DropZone = styled.div`
  min-height: 100%;
  min-height: calc(100% - 10px);

  > div:not(.deals) {
    background: ${colors.borderPrimary};
    border-radius: ${borderRadius};
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.03);
  }
`;

const Indicator = styled.div`
  display: flex;
  margin-top: 5px;

  > div {
    margin-right: 4px;

    &:last-of-type {
      margin: 0;
    }
  }
`;

const IndicatorItem = styledTS<{ isPass: boolean }>(styled.div)`
  flex: 1;
  background: ${props =>
    props.isPass ? colors.colorSecondary : colors.colorWhite};
  height: 4px;
  border-radius: 2px;
`;

export { Container, Header, Amount, Body, DropZone, Indicator, IndicatorItem };
