import styled from 'styled-components';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import styledTS from 'styled-components-ts';
import { colors, dimensions } from '@erxes/ui/src/styles';
import { highlight } from '@erxes/ui/src/utils/animations';
import { rgba } from '@erxes/ui/src/styles/ecolor';
import { Column as CommonColumn } from '@erxes/ui/src/styles/main';
export const SectionContent = styledTS<{}>(styled.div)`
    display:flex;
    padding: 10px 10px;
    justify-content:space-around;
    align-items: center;
`;

export const Padding = styledTS<{
  horizontal?: boolean;
  vertical?: boolean;
  padding?: string;
}>(styled.div)`
  padding: ${({ horizontal, vertical, padding }) =>
    !horizontal && !vertical
      ? '10px'
      : `${vertical ? (padding ? `${padding}px` : '10px') : '0px'} ${
          horizontal ? (padding ? `${padding}px` : '10px') : '0px'
        }`}
`;
export const ClearableBtn = styled.a`
  cursor: pointer;
`;

export const SidebarHeader = styled.h5`
  margin-bottom: ${dimensions.coreSpacing}px;
  color: ${colors.colorPrimary};
  padding-left: 10px;
`;

export const SelectBox = styled.div`
  display: flex;
  width: 125px;
  height: 40px;
  text-align: center;
  margin-bottom: 5px;
  border-radius: 6px;
  box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);
  justify-content: center;
  place-items: center;
  cursor: pointer;
  gap: 5px;

  &.active {
    animation: ${highlight} 0.9s ease;
    box-shadow: 0 0 5px 0 #63d2d6;
  }
`;

export const SelectBoxContainer = styledTS<{
  row?: boolean;
}>(styled.div)`
  display: flex;
  flex-wrap: wrap;
  flex-direction: ${({ row }) => row && 'row'};
  padding-top:10px;
  place-content:center;
  gap: 5px;
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

export const EndDateContainer = styled.div`
  .rdtPicker {
    left: -98px !important;
  }
`;

export const Row = styledTS<{ gap?: number; spaceBetween?: boolean }>(
  styled.div
)`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  align-items: center;
  gap: ${({ gap }) => (gap ? `${gap}px` : '')};
  justify-content: ${({ spaceBetween }) =>
    spaceBetween ? `space-between` : ''};
  margin-right: ${dimensions.coreSpacing}px;
`;

export const ResponseCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  color: ${colors.colorCoreGray};
  box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);
  border-radius: 5px;
`;
export const ResponseCardContent = styled.div`
  display: flex;
  justify-content: space-between;
`;
export const ResponseCardDescription = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 150px;
`;

export const AssignedMemberCard = styled.div`
  color: ${colors.textSecondary};
  padding:10px
  display: flex;
  justify-content: space-between;
  align-items:center
`;

export const Column = styledTS<{ border?: boolean }>(styled(CommonColumn))`
  border-right: ${({ border }) => (border ? '1px solid #ddd' : '')} 
  margin-right: ${dimensions.coreSpacing}px;
`;

export const DividerBox = styled.span`
  margin-bottom: ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreRed};
  border: 1px solid ${colors.colorCoreRed};
  border-radius: 2px;
  padding: 3px 5px;
  font-size: 8px;
  display: inline-block;
  font-weight: bold;
  text-transform: uppercase;
`;
const Options = styled.div`
  display: inline-block;
  width: 100%;
  margin-top: 10px;
`;
const GoalTypesTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 48%;
  float: left;
  min-height: 110px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 4px;
  margin-bottom: 4%;
  padding: 20px;
  transition: all ease 0.3s;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);

  &:nth-of-type(even) {
    margin-left: 4%;
  }

  > i {
    margin-bottom: 10px;
  }

  &:hover {
    cursor: pointer;
    box-shadow: 0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)};
  }
`;

const SidebarFilters = styledTS(styled.div)`
  overflow: hidden;
  padding: 5px 15px 30px 15px;
`;
export { SidebarFilters };
export { GoalTypesTableWrapper, FlexRow };

export const BoardItemWrapper = styled(DrawerDetail)`
  > div > div {
    padding: 0;
  }
`;

export const Card = styled.div`
  display: flex;
  width: 150px;
  height: 40px;
  text-align: center;
  margin-bottom: 5px;
  border-radius: 6px;
  box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);
  justify-content: center;
  place-items: center;
  cursor: pointer;
  gap: 5px;

  &.active {
    animation: ${highlight} 0.9s ease;
    box-shadow: 0 0 5px 0 #63d2d6;
  }
`;
const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .flex-item {
    flex: 1;
    margin-left: ${dimensions.coreSpacing}px;

    &:first-child {
      margin: 0;
    }

    input[type='checkbox'] {
      display: inline-block;
      height: auto;
      width: auto;
      margin-right: 5px;
    }
  }

  button {
    margin-left: ${dimensions.coreSpacing / 2}px;
  }

  & + div {
    margin-top: ${dimensions.coreSpacing / 2}px;
  }
`;

export { FieldWrapper, Options };
