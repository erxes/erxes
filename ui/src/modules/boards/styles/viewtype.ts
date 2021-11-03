import styled from 'styled-components';
import { dimensions } from 'modules/common/styles';
import { colors } from 'modules/common/styles';

export const RowFill = styled.div`
  display: flex;
  padding: 5px 5px 5px 20px;
`;

export const FieldStyle = styled.div`
  margin: 2px 0 0 5px;
`;

export const ActivityList = styled.div`
  padding: ${dimensions.coreSpacing}px;
  position: relative;
  overflow: visible;
  margin: ${dimensions.coreSpacing}px;
  border-radius: 2px;
  height: auto;
  transition: height 0.3s ease-out 0s;
  background-color: rgb(255, 255, 255);
  box-shadow: rgb(0 0 0 / 8%) 0px 0px 6px 1px;
  word-break: break-word;
  font-weight: 500;
  font-size: 12px;
  display: flex;
`;

export const InfoSection = styled.div`
  align-self: center;
  display: flex;
  flex: 1 1 0%;
`;

export const DateType = styled.div`
  align-self: center;
  color: ${colors.colorCoreGray};
  font-size: 11px;
`;

export const GanttContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  height: 500px;
  margin: 10px;
`;

export const NavContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  background: -moz-linear-gradient(top, #eeeeee 0%, #cccccc 100%);
  background: -webkit-linear-gradient(
    top,
    #eeeeee 0%,
    #cccccc 100%
  ); /* Chrome10-25,Safari5.1-6 */
  background: linear-gradient(to bottom, #eeeeee 0%, #cccccc 100%);
  height: 50px;
  color: grey;
  align-items: center;
`;

export const List = styled.div`
  width: 200px;
  height: 50%;
  border: solid 1px silver;
  border-radius: 10px;
  box-shadow: 2px 2px silver;
`;

export const ModeContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: baseline;
  justify-self: flex-end;
  margin: 0px 20px;
`;
export const ModeTitle = styled.div`
  margin: 0px 20px;
  flex: 1 1 auto;
  margin: 0px 20px;
  text-shadow: 0.5px 0.5px white;
  font-family: Helvetica, sans-serif;
  font-size: 22px;
  font-weight: bolder;
`;

export const ModeItem = styled.div`
  flex: 0 0 auto;
  width: 80px;
  padding: 5px;
  border: solid 1px silver;
  background-color: #333333;
  color: white;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
`;

export const OperationButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: baseline;
  justify-self: flex-end;
`;
