import { colors } from 'modules/common/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';
import { stageWidth } from './deminsions';

const hoverColor = 'rgba(10,45,65,.13)';
const stageGray = '#dee3e6';
const secondaryText = '#6a818c';

const Header = styled.div`
  padding: 8px 16px;
  position: relative;
  background: ${stageGray};

  h4 {
    margin: 0;
    font-size: 11px;
    line-height: inherit;
    text-transform: uppercase;
    font-weight: bold;

    span {
      color: ${secondaryText};
      margin-left: 5px;
      font-size: 90%;
    }
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
    box-shadow: ${props.isDragging
      ? `0 0 20px 2px rgba(0, 0, 0, 0.14)`
      : 'none'};
  `};
  overflow: hidden;
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
  overflow: auto;
  background: ${stageGray};
`;

const StageFooter = styled.div`
  background: ${stageGray};
  border-radius: 0 0 3px 3px;
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
    props.isPass ? colors.colorCoreBlue : colors.colorWhite};
  height: 4px;
  border-radius: 2px;
`;

export {
  AddNew,
  Container,
  Header,
  Amount,
  Body,
  Indicator,
  IndicatorItem,
  StageFooter
};
