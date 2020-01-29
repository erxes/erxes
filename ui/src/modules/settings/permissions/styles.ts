import { colors, dimensions } from 'modules/common/styles';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const FilterWrapper = styled.div`
  padding: 5px 0;
  display: flex;
  flex-wrap: wrap;
`;

const FilterItem = styled.div`
  position: relative;
  float: left;
  min-width: 200px;
  margin-right: 20px;
`;

const NotWrappable = styled.div`
  white-space: nowrap;
`;

const Capitalize = styled.span`
  text-transform: capitalize;
  font-weight: 500;
`;

const StepItem = styled.div`
  box-shadow: rgba(0, 0, 0, 0.15) 0px 1px 5px 0;
  border-radius: 2px;
  margin-bottom: ${dimensions.unitSpacing}px;

  &:last-of-type {
    margin: 0;
  }
`;

const StepHeader = styledTS<{ isDone?: boolean; number: string }>(styled.div)`
  border-bottom: 1px solid ${colors.borderPrimary};
  padding: 15px 30px 15px 70px;
  position: relative;
  background: ${colors.bgLight};
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
  font-weight: 500;

  &:before {
    box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.1);
    position: absolute;
    left: ${dimensions.coreSpacing}px;
    top: 10px;
    content: '${props => (props.isDone ? '✓' : props.number)}';
    width: 30px;
    height: 30px;
    border-radius: 15px;
    background-color: ${props =>
      props.isDone ? colors.colorCoreGreen : colors.colorCoreTeal};
    color: ${colors.colorWhite};
    line-height: 30px;
    text-align: center;
    font-size: 11px;
    font-weight: bold;
    transition: background-color .3s ease;
  }
`;

const StepBody = styled.div`
  padding: 20px 30px 30px 70px;
  background: ${colors.colorWhite};

  > div:last-of-type {
    margin: 0;
  }
`;

const Divider = styled.span`
  margin-bottom: ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreRed};
  border: 1px solid ${colors.colorCoreRed};
  border-radius: 2px;
  padding: 3px 5px;
  font-size: 8px;
  display: inline-block;
  font-weight: bold;
  text-transform: uppercase;
`;

const ActionButtons = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  transition: all 0.3s ease;

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export {
  FilterWrapper,
  FilterItem,
  NotWrappable,
  Capitalize,
  StepItem,
  StepHeader,
  StepBody,
  Divider,
  ActionButtons
};
