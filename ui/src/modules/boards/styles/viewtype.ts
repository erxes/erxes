import { colors } from 'modules/common/styles';
import styled from 'styled-components';

export const ChartContainer = styled.div`
  background-color: ${colors.colorWhite};
  width: 100%;
  height: 800px;
`;

export const EmptyWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;

  .ant-empty-description {
    margin-top: 20px;
  }
`;
