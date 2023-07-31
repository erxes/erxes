import styled from 'styled-components';
import { colors, dimensions } from '@erxes/ui/src/styles';
export const ChatListSearch = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.coreSpacing}px;
  input {
    background-color: white;
  }
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
