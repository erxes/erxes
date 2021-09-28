import styled from 'styled-components';
import { dimensions } from 'modules/common/styles';
import { colors } from 'modules/common/styles';

const linkText = 'rgb(23, 133, 252);';

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

  span {
    align-self: center;
    color: ${colors.colorLightGray};
  }

  i {
    margin-left: 10px;
  }
`;

export const NameCardStyle = styled.div`
  margin-left: ${dimensions.coreSpacing}px;
  display: flex;
  color: ${linkText};
`;

export const ActionText = styled.div`
  align-self: center;
  margin-left: ${dimensions.coreSpacing}px;
`;

export const DescText = styled.div`
  align-self: center;
  flex: 1 1 0%;
  margin-left: ${dimensions.coreSpacing}px;
  color: ${linkText};
`;
