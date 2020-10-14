import styled from 'styled-components';
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
  font-size: 14px;
  line-height: 30px;
  border-right: #dadce0 1px solid;
  color: #70757a;
  -webkit-box-flex: 1 1 0%;
  -webkit-flex: 1 1 0%;
  flex: 1 1 0%;
  display: block;
`;

const Day = styled.h2`
  margin-top: 8px;
  font-family: Roboto, Arial, sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
  display: inline-block;
  text-align: center;
  white-space: nowrap;
  width: max-content;
  min-width: 24px;
  color: #70757a;
  line-height: 16px;
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
  Day
};
