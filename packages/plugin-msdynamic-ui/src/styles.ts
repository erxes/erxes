import { dimensions } from '@erxes/ui/src/styles';
import styled from 'styled-components';

export const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 96%;
  margin: 0 auto;
`;

export const FilterContainer = styled.div`
  padding: 10px 20px 20px;
`;

export const CustomRangeContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-end;
  > div {
    flex: 1;
    margin-right: 8px;
    input[type='text'] {
      border: none;
      width: 100%;
      height: 34px;
      padding: 5px 0;
      color: #444;
      border-bottom: 1px solid;
      border-color: #ddd;
      background: none;
      border-radius: 0;
      box-shadow: none;
      font-size: 13px;
    }
  }
`;
