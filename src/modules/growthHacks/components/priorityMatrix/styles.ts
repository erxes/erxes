import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const ChartAxis = styled.div`
  width: 100%;
  height: 100%;
  border: 1px solid ${colors.borderDarker};
  border-left-width: 2px;
  border-bottom-width: 2px;
  position: relative;

  &:before,
  &:after {
    content: '';
    position: absolute;
  }

  &:before {
    left: 50%;
    border-left: 1px solid ${colors.borderDarker};
    top: 0;
    bottom: 0;
  }

  &:after {
    left: 0;
    top: 50%;
    border-top: 1px solid ${colors.borderDarker};
    right: 0;
  }
`;

const Point = styledTS<{ x: number; y: number }>(styled.div)`
  left: ${props => props.x * 10}%;
  bottom: ${props => props.y * 10}%;
  padding: 0px 5px 0px ${dimensions.coreSpacing + 5}px;
  border-radius: 12px;
  position: absolute;
  background: ${colors.bgLight};
  font-size: 12px;
  line-height: ${dimensions.coreSpacing + 4}px;
  border: 1px solid ${colors.borderDarker};
  margin-bottom: -${dimensions.unitSpacing - 2}px;
  margin-left: -${dimensions.unitSpacing - 2}px;
  z-index: 10;

  &:before {
    content: '';
    width: ${dimensions.unitSpacing + 8}px;
    height: ${dimensions.unitSpacing + 8}px;
    border-radius: ${dimensions.unitSpacing}px;
    background: ${colors.colorCoreBlue};
    position: absolute;
    left: 3px;
    top: 3px;
  }

  span {
    width: 65px;
    overflow: hidden;
    display: block;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const ChartLegends = styled.div`
  > span {
    position: absolute;
    color: ${colors.colorCoreLightGray};
    text-transform: uppercase;
    font-size: 10px;
    line-height: 10px;
    font-weight: 500;

    &.top-left,
    &.top-right {
      top: 50%;
    }

    &.top-left {
      left: ${dimensions.unitSpacing}px;
      margin-top: -${dimensions.coreSpacing}px;
    }

    &.top-right {
      left: 50%;
      margin-top: -${dimensions.coreSpacing}px;
      margin-left: ${dimensions.unitSpacing}px;
    }

    &.bottom-left,
    &.bottom-right {
      bottom: ${dimensions.unitSpacing}px;
    }

    &.bottom-left {
      left: ${dimensions.unitSpacing}px;
    }

    &.bottom-right {
      left: 50%;
      margin-left: ${dimensions.unitSpacing}px;
    }
  }
`;

const Axis = styled.div`
  position: absolute;
  line-height: ${dimensions.coreSpacing}px;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 12px;
  color: ${colors.colorCoreLightGray};
`;

const AxisY = styled(Axis)`
  bottom: 50%;
  writing-mode: tb-rl;
  transform: rotate(-180deg);
  left: -30px;
  margin-bottom: -${dimensions.coreSpacing}px;
`;

const AxisX = styled(Axis)`
  bottom: -30px;
  left: 50%;
  margin-left: -${dimensions.coreSpacing}px;
`;

const ExperimentList = styled.ul`
  padding-left: ${dimensions.coreSpacing}px;
  margin-left: ${dimensions.coreSpacing}px;

  li {
    padding-bottom: ${dimensions.unitSpacing - 5}px;
  }
`;

const PopoverHeader = styled.h3`
  padding: ${dimensions.unitSpacing}px;
  margin: 0;
  font-size: 14px;
  background-color: #f7f7f7;
  font-weight: 400;
  text-align: center;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

export {
  ChartAxis,
  ChartLegends,
  Point,
  AxisX,
  AxisY,
  ExperimentList,
  PopoverHeader
};
