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

export const MeetingWrapper = styled.div`
  padding: 0 ${dimensions.coreSpacing}px;
  margin-bottom: ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.coreSpacing}px;
`;

export const MeetingDetailRow = styled.tr`
  font-size: 18px;
`;
export const MeetingDetailColumn = styled.td`
  width: 600px;
`;

export const FormWrapper = styled.div`
  width: 100%;
  padding: 25px;
`;
export const BoxWrapper = styled.div`
  width: 100%;
  margin-top: ${dimensions.coreSpacing}px;
`;
