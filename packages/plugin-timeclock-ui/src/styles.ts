import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { DateContainer, SimpleButton } from '@erxes/ui/src/styles/main';
import { colors, dimensions, typography } from '@erxes/ui/src/styles';

const FilterWrapper = styled.div`
  margin: 10px 20px 0 20px;
  padding-bottom: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid ${colors.borderPrimary};

  strong {
    margin-right: 2 0px;
  }
`;

const ConfigFormWrapper = styled.div`
  label > span:before {
    border-radius: 0;
  }
`;

const AlertContainer = styled.div`
  > div {
    > div {
      align-items: start;
      overflow: scroll;
      height: 600px;
    }
  }
`;
const SidebarHeader = styledTS<{
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

const CustomRangeContainer = styled.div`
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

const CustomRow = styledTS<{
  marginNum: number;
}>(styled.div)`
  margin: ${props => props.marginNum}px 0
`;

const Input = styledTS<{
  round?: boolean;
  hasError?: boolean;
  align?: string;
  type?: string;
}>(styled.input)`
  border: none;
  width: 100%;
  padding: ${dimensions.unitSpacing}px 0;
  color: ${colors.textPrimary};
  border-bottom: 1px solid;
  border-color:${props =>
    props.hasError ? colors.colorCoreRed : colors.colorShadowGray};
  background: none;
  transition: all 0.3s ease;
  type: ${props => {
    if (props.type) {
      return props.type;
    }
  }}
  ${props => {
    if (props.round) {
      return `
        font-size: 13px;
        border: 1px solid ${colors.borderDarker};
        border-radius: 20px;
        padding: 5px 20px;
      `;
    }

    return '';
  }};

  ${props => {
    if (props.align) {
      return `
        text-align: ${props.align};
      `;
    }

    return '';
  }};

  &:hover {
    border-color: ${colors.colorLightGray};
  }

  &:focus {
    outline: none;
    border-color: ${colors.colorSecondary};
  }

  ::placeholder {
    color: #aaa;
  }
`;

const Row = styled.div`
  display: flex;

  .Select {
    flex: 1;
  }

  button {
    flex-shrink: 0;
    margin-left: 10px;
    align-self: baseline;
  }
`;

const FilterItem = styled(DateContainer)`
  position: relative;
  float: left;
  min-width: 200px;
  margin-right: 20px;
  z-index: 100;
`;

const DropdownWrapper = styled.div`
  position: relative;
  > div {
    padding-left: 20px;
  }
`;

const FlexCenter = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const SidebarActions = styled.div`
  #date-popover {
    max-width: 470px;
    width: 500px;
  }

  .rdtPicker {
    width: 100%;
  }
`;

const ToggleButton = styled(SimpleButton)`
  margin-left: -5px;
  margin-right: 10px;
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const FlexRowLeft = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: start;
`;

const InlineBlock = styled.div`
  display: inline;
  align-items: center;
`;

const CustomLabel = styledTS<{ uppercase?: boolean }>(styled.label)`
  text-transform: ${props => (props.uppercase ? 'uppercase' : 'none')};
  display: inline-block;
  margin: 10px 0;
  font-weight: ${typography.fontWeightRegular};
  font-size: 14px;
  color: ${colors.textPrimary};

  > span {
    color: ${colors.colorCoreRed};
  }
`;

const FlexRowEven = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px
  justify-content: space-evenly;
`;

const CustomFlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px
  justify-content: start;
  max-width: 460px;
`;

const FlexColumn = styledTS<{
  marginNum: number;
}>(styled.div)`
  display: flex;
  flex-direction: column;
  gap:${props => props.marginNum}px;
`;

const FlexColumnMargined = styledTS<{
  marginNum: number;
}>(styled.div)`
  display: flex;
  flex-direction: column;
  gap: ${props => props.marginNum}px
  margin-top:${props => props.marginNum * 2}px;
`;

const FlexColumnCustom = styledTS<{
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

const CustomWidthDiv = styledTS<{
  width: number;
}>(styled.div)`
    width: ${props => props.width}px
    justify-content: right;
  `;

const TextAlignCenter = styled.div`
  text-align: center;
`;

const TextAlignRight = styled.div`
  text-align: right;
`;

const ToggleDisplay = styledTS<{
  display: boolean;
}>(styled.div)`
  display: ${props => (props.display ? 'inline' : 'none')};
`;

const DateName = styled.div`
  text-transform: uppercase;
  margin: ${dimensions.unitSpacing}px 0;
  text-align: center;
`;

const MarginX = styledTS<{ margin: number }>(styled.div)`
  margin: 0 ${props => props.margin}px;
`;

const MarginY = styledTS<{ margin: number }>(styled.div)`
  margin: ${props => props.margin}px 0;
`;

const RowField = styled.div`
  width: 33%;
  border-top: 1px solid ${colors.borderPrimary};
  display: flex;
  flex-direction: column;
  justify-content: center;

  &:last-child {
    width: 10%;
    padding: 8px 20px 8px 0;
    text-align: right;
  }
`;

const CustomCollapseRow = styledTS<{ isChild: boolean }>(styled.div)`
  font-size: 15px;
  position: relative;
  display: flex;
  overflow: hidden;
  justify-content: space-between;
  align-items: center;
  padding: ${props =>
    props.isChild ? dimensions.unitSpacing : dimensions.coreSpacing}px;
  margin: 0px;
  background: ${colors.colorWhite};
  
  div {
    display: flex
    flex: 1
    gap: 10px
  }
  span {
    font-size: 12px;
    color: ${colors.colorCoreGray};
    margin-left: 5px;
  }
`;

export {
  FilterItem,
  FilterWrapper,
  Row,
  FlexCenter,
  DropdownWrapper,
  SidebarActions,
  Input,
  FlexRow,
  FlexRowLeft,
  CustomFlexRow,
  CustomWidthDiv,
  FlexColumn,
  FlexColumnMargined,
  FlexColumnCustom,
  DateName,
  CustomRangeContainer,
  SidebarHeader,
  CustomRow,
  FlexRowEven,
  ToggleDisplay,
  ConfigFormWrapper,
  ToggleButton,
  InlineBlock,
  MarginX,
  MarginY,
  RowField,
  TextAlignCenter,
  TextAlignRight,
  CustomCollapseRow,
  CustomLabel,
  AlertContainer
};
