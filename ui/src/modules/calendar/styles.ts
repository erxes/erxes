import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors } from '../common/styles';

const CalendarContainer = styled.div`
  background: ${colors.bgLight};
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow-y: hidden;
  outline: none;
`;

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
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
  border-left: #dadce0 1px solid;
`;

const Header = styled.div`
  margin: 0;
  -webkit-align-items: stretch;
  align-items: stretch;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-flex: none;
  -webkit-flex: none;
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
  font-family: Roboto, Arial, sans-serif;
  text-transform: uppercase;
`;

const Presentation = styled.div`
  margin: 0;
  overflow: hidden;
  -webkit-box-flex: 1 1 0%;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-direction: column;
  flex-direction: column;
`;

const Row = styled.div`
  position: relative;
  overflow: hidden;
  border-bottom: #dadce0 1px solid;
  display: -webkit-box;
  display: -webkit-flex;
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
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
`;

const Cell = styled.div`
  border-right: #dadce0 1px solid;
  color: #70757a;
  -webkit-box-flex: 1 1 0%;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
  display: block;
`;

const Day = styledTS<{ isSelectedDate?: boolean }>(styled.h2)`
  font-size: 14px;
  line-height: 30px;
  margin: 2px 0 0 2px;
  font-family: Roboto, Arial, sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  width: max-content;
  min-width: 24px;
  min-height: 24px;
  color: #70757a;
  line-height: 24px;
  border-radius: 50%;
  ${props =>
    props.isSelectedDate &&
    `
    background-color: ${colors.colorPrimary};
    color: #fff;
  `}
`;

const DayRow = styled.div`
  border-bottom: #dadce0 1px solid;

  span {
    border-right: #dadce0 1px solid;
    display: inline-block;
    min-height: 40px;
    line-height: 40px;
    width: 60px;
    text-align: center;
  }
`;

const MainContainer = styled.div`
  background-color: #fff;
`;

const DayHeader = styled.h3`
  color: #222;
  padding: 12px;
  margin: 0px;
`;

const SidebarWrapper = styled.div`
  background: #fff;
  padding: 12px;
`;

const CalendarController = styled.div`
  i {
    font-wheight: bold;
    font-size: 20px;
    cursor: pointer;
  }

  label {
    margin-left: 8px;
  }
`;

const EventTitle = styled.div`
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
`;

const EventContainer = styled.div``;

const EventContent = styled.div`
  i {
    position: absolute;
  }

  div {
    padding-left: 20px;
  }
`;

export {
  CalendarContainer,
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
  DayHeader,
  SidebarWrapper,
  EventContainer,
  EventTitle,
  EventContent,
  CalendarController
};
