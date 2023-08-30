import styled from 'styled-components';
import styledTS from 'styled-components-ts';

import { colors, dimensions, typography } from '@erxes/ui/src/styles';
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
  .description {
    padding: 4px;
    border: 1px solid ${colors.borderDarker};
    border-radius: 8px;
    margin: 10px 0 10px 0;
  }
`;

export const MeetingDetailRow = styled.tr`
  font-size: 14px;
  margin-top: 10px;
`;

export const MeetingDetailFooter = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: center;
`;
export const MeetingDetailColumn = styled.td`
  width: 600px;
  padding: ${dimensions.unitSpacing / 2}px 0;
  span {
    color: ${colors.colorCoreBlue};
  }
`;

export const FormWrapper = styled.div`
  width: 100%;
  padding: 25px;
`;

export const BoxWrapper = styled.div`
  width: 100%;
  margin-top: ${dimensions.coreSpacing}px;
`;

export const FeatureRowItem = styled.div`
  min-width: 150px;
  margin-left: 30px;
  margin-top: 30px;
  width: 300px;
`;

export const SidebarHeader = styledTS<{
  spaceBottom?: boolean;
  uppercase?: boolean;
  bold?: boolean;
}>(styled.div)`
  height: ${dimensions.headerSpacing}px;
  text-transform: ${props => props.uppercase && 'uppercase'};
  font-weight: ${props => (props.bold ? 'bold' : '500')};
  display: flex;
  font-size: ${typography.fontSizeHeading8}px;
  flex-direction: column;
  margin: 0px ${dimensions.coreSpacing}px;
`;

export const SidebarActions = styled.div`
  #date-popover {
    max-width: 470px;
    width: 500px;
  }

  .rdtPicker {
    width: 100%;
  }
`;

export const FlexColumnCustom = styledTS<{
  marginNum: number;
}>(styled.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.marginNum}px
  margin: 20px 20px

  div:first-child {
    margin-bottom: 0;
  }

  `;
