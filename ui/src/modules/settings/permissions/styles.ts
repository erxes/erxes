import { colors, dimensions } from 'modules/common/styles';
import { DateContainer } from 'modules/common/styles/main';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { ActionButtons, SidebarListItem } from '../styles';

const FilterWrapper = styled.div`
  padding: 10px 20px ;
  display: flex;
  flex-wrap: wrap;
  align-items: center;

  strong {
    margin-right: 10px;
  }
`;

const FilterItem = styled(DateContainer)`
  position: relative;
  float: left;
  min-width: 200px;
  margin-right: 20px;
  z-index: 100;
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

const SidebarItem = styled(SidebarListItem)`
  &:hover {
    ${ActionButtons} {
      width: 55px;
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
  SidebarItem
};
