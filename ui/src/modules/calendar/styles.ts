import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '../common/styles';

const rowHeight = 40;
const borderColor = '#D9E2EC';
const textColor = '#70757a';

const CalendarWrapper = styled.div`
  z-index: auto;
  opacity: 1;
  transform: none;
  will-change: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: block;
`;

const Grid = styled.div`
  background-color: #fff;
  min-height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  margin: 0;
  align-items: stretch;
  display: flex;
  flex: none;
  height: 20px;
  border-bottom: ${borderColor} 1px solid;
`;

const ColumnHeader = styled.div`
  border-right: ${borderColor} 1px solid;
  flex: 1 1 0%;
  text-align: center;
  font-size: 11px;
  line-height: 20px;
  color: ${textColor};
  font-weight: 500;
  text-transform: uppercase;

  &:last-child {
    border: none;
  }
`;

const Presentation = styled.div`
  margin: 0;
  overflow: hidden;
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  position: relative;
  overflow: hidden;
  border-bottom: ${borderColor} 1px solid;
  display: flex;
  flex: 1 1 0%;
  min-height: 80px;
`;

const RowWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
`;

const Cell = styled.div`
  border-right: ${borderColor} 1px solid;
  color: ${textColor};
  flex: 1 1 0%;
  display: block;
  min-height: 70px;

  &:last-child {
    border: none;
  }
`;

const Day = styledTS<{ isSelectedDate?: boolean }>(styled.h2)`
  font-size: 14px;
  line-height: 30px;
  margin: 2px 0 0 2px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  width: max-content;
  min-width: 22px;
  color: ${textColor};
  line-height: 22px;
  border-radius: 8px;
  
  ${props =>
    props.isSelectedDate &&
    `
    background-color: ${colors.colorSecondary};
    color: #fff;
  `}

  
  &:hover {
    cursor: pointer;
    background-color: ${colors.colorPrimary};
    color: #fff;
  }
`;

const AddEventBtn = styled.div`
  background-color: ${colors.colorCoreGreen};
  position: absolute;
  top: 0;
  right: 0;
  width: ${dimensions.coreSpacing}px;
  height: ${dimensions.coreSpacing}px;
  border-radius: 4px;
  line-height: ${dimensions.coreSpacing}px;
  color: ${colors.colorWhite};
  text-align: center;
  cursor: pointer;
  opacity: 0;
  transition: all ease 0.4s;
`;

const DayRow = styled.div`
  border-bottom: ${borderColor} 1px solid;
  display: flex;
  position: relative;

  ${Header} {
    flex: 1 1 0%;
    height: ${rowHeight}px;
    border-bottom: none;
    cursor: none;
  }

  span {
    border-right: ${borderColor} 1px solid;
    display: inline-block;
    min-height: ${rowHeight}px;
    line-height: ${rowHeight}px;
    width: 60px;
    text-align: center;
  }

  &:hover {
    ${AddEventBtn} {
      opacity: 0.8;
    }
  }
`;

const WeekContainer = styled.div`
  display: flex;
`;

const WeekData = styled.div`
  height: ${rowHeight}px;
  line-height: ${rowHeight}px;
  border-bottom: ${borderColor} 1px solid;
  box-sizing: content-box;
  overflow: hidden;
  position: relative;
  color: ${textColor};

  &:hover {
    ${AddEventBtn} {
      opacity: 0.8;
    }
  }
`;

const WeekHours = styled.div`
  min-height: ${rowHeight}px;
  line-height: ${rowHeight}px;
  width: 60px;
  text-align: center;
  border-right: ${borderColor} 1px solid;
`;

const MainContainer = styled.div`
  height: calc(100vh - 175px);
`;

const CalendarController = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;

  h2 {
    margin: 0 20px;
    font-size: 24px;
  }

  i {
    font-size: 24px;

    line-height: 30px;
    color: ${colors.colorSecondary};

    &:hover {
      cursor: pointer;
      color: ${colors.colorCoreOrange};
    }
  }

  label {
    margin-left: 8px;
  }
`;

const CalendarItem = styled.div`
  padding: 5px 20px;
  transition: background 0.3s ease;

  &:hover {
    background: ${colors.bgMain};
  }
`;

const EventWrapper = styled.div`
  max-width: 100%;
  margin: 2px;
`;

const EventTitle = styledTS<{
  start?: number;
  height?: number;
  count: number;
  order: number;
  color: string;
}>(styled.div)`
  padding: 1px 8px;
  border-radius: 4px;
  cursor: pointer;
  line-height: 20px;
  font-size: 12px;
  height: 22px;
  overflow: hidden;
  word-break: break-all;

  b {
    font-weight: 500;
  }

  ${props => `
    background-color: ${rgba(props.color, 0.2)};
    color: ${props.color};

    &:hover {
      background-color: ${rgba(props.color, 0.3)};
    }
  `}

  ${props =>
    props.start &&
    props.height &&
    `
      position: absolute;
      top: ${rowHeight * props.start + 13}px;
      width: 100%;  
      left: ${props.order > 0 ? `${100 / (props.order + 1)}%` : '1px'};
      width: calc(${100 / props.count}% - 2px);
      height: ${rowHeight * props.height}px;
      min-height: ${rowHeight / 2}px;
  `}
`;

const EventContent = styled.div`
  i {
    position: absolute;
  }

  div {
    padding-left: 20px;
  }
`;

const WeekWrapper = styled.div`
  display: flex;
  flex: 1 1 0%;
`;

const WeekCol = styled.div`
  border-right: ${borderColor} 1px solid;
  flex: 1 1 0%;
  position: relative;

  &:last-child {
    border: none;
  }
`;

const CommonWrapper = styled.div`
  padding: 10px 20px;
`;

const SidebarHeading = styled.h4`
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.25px;
  line-height: 20px;
  margin: 0 0 15px;
  padding: 0 20px;
`;

export {
  CalendarWrapper,
  Grid,
  Header,
  ColumnHeader,
  Presentation,
  Row,
  RowWrapper,
  Cell,
  Day,
  DayRow,
  MainContainer,
  SidebarHeading,
  EventTitle,
  EventContent,
  CalendarController,
  WeekCol,
  WeekWrapper,
  WeekContainer,
  WeekHours,
  WeekData,
  AddEventBtn,
  CommonWrapper,
  CalendarItem,
  EventWrapper
};
