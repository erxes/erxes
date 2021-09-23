import styled from 'styled-components';
import { dimensions } from 'modules/common/styles';
import { colors } from 'modules/common/styles';

const secondaryText = '#6a818c';

export const RowFill = styled.div`
  display: flex;
  padding: 5px 5px 5px 20px;
`;

export const FieldStyle = styled.div`
  margin: 2px 0 0 5px;
`;

export const ActivityList = styled.div`
  border: 1px solid rgb(238, 238, 238);
  border-radius: ${dimensions.unitSpacing - 4}px;
  margin: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px 0
    ${dimensions.coreSpacing}px;
  transition: background-color 0.3s ease 0s;
  box-shadow: rgb(0 0 0 / 10%) 0px 0px 20px 2px;
  height: ${dimensions.headerSpacing + 10}px;
  font-weight: 600;
  font-size: 12px;

  span {
    color: ${colors.colorLightGray};
    margin-left: ${dimensions.coreSpacing}px;
  }
`;

export const ListFields = styled.div`
  display: flex;
  flex: 1;
  margin-top: 20px;
`;

export const NameCardStyle = styled.div`
  margin: ${dimensions.unitSpacing - 20}px ${dimensions.coreSpacing}px 0
    ${dimensions.coreSpacing}px;
  display: flex;

  p {
    margin-top: 12px;
    color: ${secondaryText};
  }
`;

export const ActionText = styled.div`
  margin-left: ${dimensions.coreSpacing}px;
  color: ${colors.colorSecondary};
`;

export const DescText = styled.div`
  margin-left: ${dimensions.coreSpacing}px;
  color: ${secondaryText};
`;
