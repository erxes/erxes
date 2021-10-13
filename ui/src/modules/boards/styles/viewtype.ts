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
