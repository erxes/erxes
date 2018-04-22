import styled, { css } from 'styled-components';
import { colors } from 'modules/common/styles';
import { stageWidth, stageHeight, borderRadius } from './deminsions';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease;
  height: 100%;
  ${props => css`
    background: ${props.isDragging ? colors.colorWhite : 'none'};
    box-shadow: ${props.isDragging
      ? `0 0 20px 2px rgba(0, 0, 0, 0.14)`
      : 'none'};
  `};
`;

const Header = styled.div`
  padding: 10px 20px;
  border-bottom: 1px solid ${colors.borderPrimary};
  position: relative;

  &:after,
  &:before {
    position: absolute;
    content: '';
    top: 50%;
    height: 0;
    width: 0;
  }

  &:after {
    border-top: 13px solid transparent;
    border-bottom: 13px solid transparent;
    border-left: 9px solid #fff;
    right: -9px;
    margin-top: -13px;
  }

  &:before {
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-left: 10px solid ${colors.borderPrimary};
    right: -10px;
    margin-top: -15px;
  }

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

const Wrapper = styled.div`
  display: flex;
  border-right: 1px solid ${colors.borderPrimary};
  flex-direction: column;
  width: ${stageWidth}px;
  max-height: ${stageHeight};

  &:last-of-type {
    ${Header}:before, ${Header}:after {
      border: none;
    }
  }
`;

const Amount = styled.ul`
  list-style: none;
  margin: 5px 0 0;
  overflow: hidden;
  padding: 0;

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
  padding: 10px;
  height: 100%;
  overflow: auto;
  background: ${colors.bgLight};
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

const IndicatorItem = styled.div`
  flex: 1;
  background: ${props =>
    props.isPass ? colors.colorSecondary : colors.colorShadowGray};
  height: 4px;
  border-radius: 2px;
`;

export {
  Wrapper,
  Container,
  Header,
  Amount,
  Body,
  DropZone,
  Indicator,
  IndicatorItem
};
