import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '../common/styles';

const rowHeight = 40;

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
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  margin: 0;
  -webkit-align-items: stretch;
  align-items: stretch;
  display: flex;
  flex: none;
  height: 20px;
  border-bottom: #dadce0 1px solid;
`;

const ColumnHeader = styled.div`
  border-right: #dadce0 1px solid;
  -webkit-box-flex: 1 1 0%;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
  text-align: center;
  text-transform: uppercase;

  &:last-child {
    border: none;
  }
`;

const Presentation = styled.div`
  margin: 0;
  overflow: hidden;
  -webkit-box-flex: 1 1 0%;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
`;

const Row = styled.div`
  position: relative;
  overflow: hidden;
  border-bottom: #dadce0 1px solid;
  display: flex;
  -webkit-box-flex: 1 1 0%;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
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
  border-right: #dadce0 1px solid;
  color: #70757a;
  -webkit-box-flex: 1 1 0%;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
  display: block;

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
  min-width: 24px;
  color: #70757a;
  line-height: 24px;
  border-radius: 8px;
  
  ${props =>
    props.isSelectedDate &&
    `
    background-color: ${colors.colorPrimary};
    color: #fff;
  `}

  cursor: pointer;
  &:hover {
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
  border-bottom: #dadce0 1px solid;
  display: flex;
  position: relative;

  ${Header} {
    flex: 1 1 0%;
    height: ${rowHeight}px;
    border-bottom: none;
    cursor: none;
  }

  span {
    border-right: #dadce0 1px solid;
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
  border-bottom: #dadce0 1px solid;
  box-sizing: content-box;
  overflow: hidden;
  position: relative;

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
  border-right: #dadce0 1px solid;
`;

const MainContainer = styled.div`
  height: calc(100vh - 171px);
`;

const CalendarController = styled.div`
  display: flex;
  align-items: center;

  h2 {
    margin: 0 20px 0 0;
    font-size: 24px;
  }

  i {
    font-size: 20px;
    cursor: pointer;
    color: ${colors.colorPrimary};
  }

  label {
    margin-left: 8px;
  }
`;

const EventTitle = styledTS<{
  start?: number;
  height?: number;
  color: string;
}>(styled.div)`
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  line-height: 1.2em;

  i {
    margin-right: 4px;
  }

  &:hover {
    background-color: #eee;
  }
  ${props =>
    `
    background-color: ${props.color};
    color: #fff;
  `}

  ${props =>
    props.start &&
    props.height &&
    `position: absolute;
    top: ${rowHeight * props.start}px;
    width: 100%;
    color: ${colors.colorWhite};
    height: ${rowHeight * props.height}px;
    min-height: ${rowHeight}px;
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
  border-right: #dadce0 1px solid;
  flex: 1 1 0%;
  position: relative;

  &:last-child {
    border: none;
  }
`;

const Calendars = styled.div`
  padding: 10px 20px;
`;

const EventContainer = styled.div``;

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
  EventContainer,
  EventTitle,
  EventContent,
  CalendarController,
  WeekCol,
  WeekWrapper,
  WeekContainer,
  WeekHours,
  WeekData,
  AddEventBtn,
  Calendars
};
