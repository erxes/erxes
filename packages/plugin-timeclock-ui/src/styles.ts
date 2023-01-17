import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { DateContainer } from '@erxes/ui/src/styles/main';
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

const Input = styledTS<{ round?: boolean; hasError?: boolean; align?: string }>(
  styled.input
)`
  border: none;
  width: 100%;
  padding: ${dimensions.unitSpacing}px 0;
  color: ${colors.textPrimary};
  border-bottom: 1px solid;
  border-color:${props =>
    props.hasError ? colors.colorCoreRed : colors.colorShadowGray};
  background: none;
  transition: all 0.3s ease;

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

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
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

const DateName = styled.div`
  text-transform: uppercase;
  margin: ${dimensions.unitSpacing}px 0;
  text-align: center;
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
  FlexColumn,
  FlexColumnMargined,
  DateName,
  CustomRangeContainer,
  SidebarHeader,
  CustomRow
};
