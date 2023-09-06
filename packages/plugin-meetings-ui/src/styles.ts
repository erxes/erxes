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
    padding: 4px 8px;
    border: 1px solid ${colors.borderDarker};
    border-radius: 8px;
    margin: 10px 0 10px 0;
  }
`;

export const MeetingDetailRow = styled.div`
  font-size: 14px;
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`;

export const MeetingDetailFooter = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: center;
`;
export const MeetingDetailColumn = styled.div`
  padding: ${dimensions.unitSpacing / 2}px 0;
  flex: 1 1 0px;
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

export const ActionTop = styled.div`
  display: flex;

  > * {
    margin-left: ${dimensions.coreSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

interface ContainerBoxType {
  row?: boolean;
  column?: boolean;
  gap?: number;
  justifyCenter?: boolean;
  justifyEnd?: boolean;
  align?: string;
  spaceBetween?: boolean;
  spaceAround?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
  marginX?: number;
  marginY?: number;
  rightBorder?: boolean;
  flexWrap?: boolean;
  placeContentEnd?: boolean;
}

export const ContainerBox = styledTS<ContainerBoxType>(styled.div)`
    display:flex;
    flex-wrap:${({ flexWrap }) => (flexWrap ? 'wrap' : '')};
    flex-direction:${({ row }) => (row ? 'row' : '')} ${({ column }) =>
  column ? 'column' : ''};
    gap: ${({ gap }) => (gap ? `${gap}px` : '')};
    place-items: ${({ align }) => (align ? `${align}` : '')};
    place-content:${({ placeContentEnd }) => (placeContentEnd ? 'end' : '')};
    padding: ${({ horizontal, vertical }) =>
      horizontal && vertical
        ? '10px'
        : `${vertical ? '10px' : '0px'} ${horizontal ? '10px' : '0px'}`};
    justify-content: ${({ spaceBetween }) =>
      spaceBetween ? 'space-between' : ''};
    justify-content:${({ spaceAround }) => (spaceAround ? 'space-around' : '')};
    justify-content: ${({ justifyEnd }) => (justifyEnd ? 'end' : '')};
    justify-content: ${({ justifyCenter }) =>
      justifyCenter ? 'center  ' : ''};
    margin:${({ marginX, marginY }) =>
      `${marginX ? `${marginX}px` : '0px'} margin${
        marginY ? `${marginY}px` : '0px'
      }`};
    border-right:${({ rightBorder }) =>
      rightBorder ? '1px solid ${colors.borderPrimary}' : ''};
`;
export const EndDateContainer = styled.div`
  .rdtPicker {
    left: -98px !important;
  }
`;

export const ParticipantList = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    .badge {
      width: 14px;
      height: 14px;
      border-radius: 14px;
      margin-left: auto;
    }
  }
`;
