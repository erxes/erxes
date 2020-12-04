import { HeaderButton } from 'modules/boards/styles/header';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '../common/styles';

const rowHeight = 40;
const borderColor = '#D9E2EC';
const textColor = '#486581';

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

const ColumnHeader = styledTS<{ isCurrent?: boolean; isWeek?: boolean }>(
  styled.div
)`
  flex: 1 1 0%;
  text-align: center;
  font-size: 11px;
  line-height: 20px;
  color: ${props => (props.isCurrent ? colors.colorSecondary : textColor)};
  font-weight: ${props => (props.isCurrent ? 'bold' : '500')};
  text-transform: uppercase;
  transform: ${props => props.isWeek && 'translateY(5px)'};

  strong {
    display: block;
    font-size: 13px;
  }

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
  min-height: 98px;
`;

const RowWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
`;

const Cell = styledTS<{ isCurrent?: boolean }>(styled.div)`
  border-right: ${borderColor} 1px solid;
  color: ${textColor};
  flex: 1 1 0%;
  display: block;
  min-height: 70px;
  background: ${props => props.isCurrent && colors.bgLight};
  position: relative;
  transition: background 0.3s ease;
  
  &:hover {
    background: ${colors.bgLight};
  }

  &:active, &:focus {
    background: ${colors.bgActive};
  }

  &:last-child {
    border: none;
  }
`;

const Day = styledTS<{ isSelectedDate?: boolean; isSameMonth: boolean }>(
  styled.h2
)`
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
  color: ${props => (props.isSameMonth ? textColor : '#9FB3C8')};
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
  z-index: 3;
`;

const DayRow = styled.div`
  display: flex;
  position: relative;

  ${Header} {
    flex: 1 1 0%;
    height: ${rowHeight}px;
    border-bottom: none;
    cursor: none;
  }

  span {
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
  padding-top: 10px;
`;

const WeekData = styled.div`
  height: ${rowHeight}px;
  line-height: ${rowHeight}px;
  border-top: ${borderColor} 1px solid;
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
  transform: translateY(-20px);
  background: #fff;

  ${WeekData} {
    border-color: transparent;
    font-size: 10px;
    padding-right: 10px;
    text-align: right;
  }
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
  background: #fff;
  position: relative;

  b {
    font-weight: 500;
  }

  ${props => `
    color: ${props.color};

    &:hover:before {
      background-color: ${rgba(props.color, 0.3)};
    }
  `}

  ${props =>
    props.start &&
    props.height &&
    `
      position: absolute;
      top: ${(rowHeight + 1) * props.start + 1}px;
      width: 100%;  
      left: ${
        props.order > 0 ? `${(100 / props.count) * props.order}%` : '1px'
      };
      width: calc(${100 / props.count}% - 2px);
      height: ${rowHeight * props.height}px;
      min-height: ${rowHeight / 2}px;
  `}

  &:before {
    content: '';
    border-radius: 4px;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    transition: background 0.3s ease;
    ${props => ` background-color: ${rgba(props.color, 0.2)};`}
  }
`;

const EventContent = styled.div`
  font-size: 14px;
`;

const EventHeading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 20px;

  h4 {
    margin: 0 10px 0 0;
  }

  > div {
    flex-shrink: 0;
  }
`;

const EventRow = styled.div`
  display: flex;
  align-items: baseline;
  margin-bottom: 10px;
  word-break: break-word;

  i {
    margin-right: 10px;
    font-size: 16px;
    color: ${colors.colorCoreGray};
  }

  ul {
    display: block;
    list-style: none;
    margin: 0;
    padding-left: 26px;
  }
`;

const WeekWrapper = styled.div`
  display: flex;
  flex: 1 1 0%;
  border-left: 1px solid ${borderColor};
`;

const WeekCol = styledTS<{ isCurrent?: boolean }>(styled.div)`
  border-right: ${borderColor} 1px solid;
  flex: 1 1 0%;
  position: relative;
  background: ${props => props.isCurrent && colors.bgLight};

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
  margin: 10px 0 10px 0;
  padding: 0 20px;
`;

const Indicator = styledTS<{ hour: number }>(styled.div)`
  position: absolute;
  top: ${props => props.hour * 41}px;
  border-top: 2px solid ${colors.colorCoreRed};
  background: red;
  left: 0;
  right: 0;

  &:before {
    content: '';
    width: 10px;
    height: 10px;
    position: absolute;
    border-radius: 5px;
    background: ${colors.colorCoreRed};
    top: -6px;
    left: -5px;
  }
`;

const HeadButton = styled(HeaderButton)`
  background: ${colors.bgLight};

  i {
    font-size: 16px;
    margin: 0;
  }
`;

const PopoverCell = styled.div`
  padding: 10px;

  h5 {
    text-align: center;
    margin: 0 0 10px 0;
    font-size: 18px;
  }

  > i {
    position: absolute;
    right: 10px;
    top: 6px;
    color: ${colors.colorCoreGray};
    cursor: pointer;
  }
`;

const SeeAll = styled.div`
  background: ${colors.bgActive};
  padding: 1px 8px;
  border-radius: 4px;
  margin: 2px;
  line-height: 20px;
  font-size: 12px;

  &:hover {
    background: ${colors.bgGray};
    cursor: pointer;
  }
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
  EventWrapper,
  Indicator,
  EventRow,
  EventHeading,
  HeadButton,
  SeeAll,
  PopoverCell
};
