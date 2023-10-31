import {
  colors,
  dimensions,
  SidebarList,
  animations,
  typography
} from '@erxes/ui/src';
import { Input } from '@erxes/ui/src/components/form/styles';
import styledTS from 'styled-components-ts';
import styled, { css } from 'styled-components';

const ContractsTableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  tr:nth-child(odd) {
    background-color: ${colors.colorShadowGray};
  }
`;

const CollateralLogo = styled.div`
  width: ${dimensions.headerSpacing}px;
  height: ${dimensions.headerSpacing}px;
  border-radius: 25px;
  margin-right: ${dimensions.coreSpacing}px;
  background: ${colors.colorSecondary};
`;

const List = styled(SidebarList)`
  li {
    border-bottom: 1px solid ${colors.borderPrimary};
    color: ${colors.textPrimary};
    white-space: normal;
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;

    span {
      color: ${colors.colorCoreLightGray};
      margin: 0;
    }

    i {
      margin-left: ${dimensions.unitSpacing / 2}px;
    }

    &:last-child {
      border: none;
    }
  }
`;

const FlexItem = styled.div`
  display: flex;
  align-items: center;
`;

const DidAmount = styled.span`
  display: contents;
  align-items: center;
  color: ${colors.textPrimary};
`;

const WillAmount = styled.span`
  display: contents;
  align-items: center;
  font-style: italic;
  text-decoration: line-through;
  color: ${colors.textSecondary};
`;

const ChooseColor = styled.div`
  width: 260px;
`;

const BackgroundSelector = styledTS<{ selected?: boolean }>(styled.li)`
  display: inline-block;
  cursor: pointer;
  border-radius: 50%;
  padding: ${dimensions.unitSpacing / 2}px;
  margin-right: ${dimensions.unitSpacing / 2}px;
  border: 1px solid
    ${props => (props.selected ? colors.colorShadowGray : 'transparent')};

  > div {
    height: ${dimensions.headerSpacing - 20}px;
    width: ${dimensions.headerSpacing - 20}px;
    background: ${colors.borderPrimary};
    border-radius: 50%;
    text-align: center;
    line-height: ${dimensions.headerSpacing - 20}px;

    > i {
      visibility: ${props => (props.selected ? 'visible' : 'hidden')};
      font-size: ${dimensions.unitSpacing}px;
      color: ${colors.colorWhite};

      &:before {
        font-weight: 700;
      }
    }
  }
`;

const ActionButtons = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  transition: all 0.3s ease;
  width: 0;

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  border-bottom: 1px solid ${colors.borderPrimary};
  background: ${props => props.isActive && colors.bgActive};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 20px;

  a {
    white-space: normal;
    flex: 1;
    padding: 10px 0 10px 20px;
    font-weight: 500;

    &:hover {
      background: none;
    }

    &:focus {
      color: inherit;
      text-decoration: none;
    }

    > span {
      color: #666;
      font-weight: normal;
    }
  }

  &:last-child {
    border: none;
  }

  &:hover {
    cursor: pointer;
    background: ${props => !props.isActive && colors.bgLight};

    ${ActionButtons} {
      width: 35px;
    }
  }
`;

const Action = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;
`;

const Name = styledTS<{ fontSize?: number }>(styled.div)`
  font-size: ${props => props.fontSize && `${props.fontSize}px`};
  font-weight: 500;

  i {
    margin-left: 10px;
    transition: all 0.3s ease;
    color: ${colors.colorCoreLightGray};

    &:hover {
      cursor: pointer;
      color: ${colors.colorCoreGray};
    }
  }
`;

const Info = styled.div`
  margin-top: 5px;
  white-space: normal;

  > span {
    font-weight: normal;
  }
`;

const InfoTitle = styled.span`
  font-weight: 500;
  margin-bottom: 5px;
  margin-right: 10px;
`;

const InfoDetail = styled.p`
  margin: 0;
  display: block;
  font-size: 12px;
  font-weight: normal;
  color: ${colors.colorCoreGray};
`;

const Description = styled.div`
  padding: 12px 22px;
  word-break: break-word;
  background: ${colors.bgLight};
  margin: 10px;
  border-radius: 3px;
  min-height: 50px;

  p {
    color: ${colors.textPrimary};
    font-size: 13px;
  }
`;

// ============== collaterals manage
const Add = styled.div`
  display: block;
  margin: 20px;
  text-align: center;
`;
const FooterInfo = styled.div`
  overflow: hidden;

  table {
    text-align: right;
    float: right;
    width: 50%;
    font-size: 14px;
  }

  ${Input} {
    direction: rtl;
  }
`;

const FormContainer = styled.div`
  margin-top: 20px;

  .Select-multi-value-wrapper {
    display: flex;
    min-width: 100px;
  }

  .Select-clear {
    line-height: 1;
  }

  .Select--single > .Select-control .Select-value {
    max-width: 135px;
  }
`;

const CollateralTableWrapper = styled.div`
  table {
    border-collapse: separate;
    border-spacing: 0 6px;

    thead tr th {
      position: inherit;
    }

    tr td {
      background: ${colors.colorWhite};

      &:first-child {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
      }

      &:last-child {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
      }
    }

    tr td,
    tr th {
      padding: 8px 12px;
      border: none;
    }
  }

  tr td:not(:first-child),
  tr th:not(:first-child) {
    text-align: right;
  }

  tr td:first-child {
    text-align: left;
  }

  tbody tr {
    margin-bottom: 5px;
    border-radius: 6px;
    box-shadow: 0 0 5px 0 rgba(221, 221, 221, 0.7);

    &.active {
      animation: ${animations.highlight} 0.9s ease;
    }
  }
`;

const ChangeAmount = styled.div`
  margin-top: 7px;
  color: ${colors.textPrimary};
`;

const ExtraDebtSection = styled.div`
  margin: 10px 0 10px 0;
  padding-top: 10px;
  color: ${colors.bgGray};
  border: none;
  border-top: 1px solid;
`;

const Amount = styled.div`
  margin-top: 1px;
  color: ${colors.textPrimary};
`;

const ContentColumn = styledTS<{ flex?: string }>(styled.div)`
  flex: ${props => (props.flex ? props.flex : '1')};
  margin-right: 10px;

  &:last-of-type {
    margin-right: 0;
  }
`;

const ContentRow = styled.div`
  display: flex;
`;

const ItemRow = styled(ContentRow)`
  margin-bottom: 5px;
  align-items: center;
`;

const ItemText = styledTS<{ align?: string }>(styled(Amount))`
  text-align: ${props => props.align || 'left'};
  flex: 2;
  font-weight: 500;
`;

const CollateralButton = styled.div`
  padding: 7px 10px;
  background: ${colors.colorWhite};
  cursor: pointer;
  border-radius: 4px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  border-bottom: 1px solid ${colors.borderDarker};
  transition: all 0.3s ease;
  background: ${colors.bgLight};

  &:hover {
    background: ${colors.bgActive};
  }

  i {
    float: right;
  }
`;

const CollateralItemContainer = styled.div`
  position: relative;
  padding: 8px;

  ${Input} {
    text-align: right;
  }
`;

const CollateralSettings = styled.div`
  flex: 1;
  border-right: 1px solid ${colors.borderPrimary};
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
  margin-right: 20px;
  padding-right: 20px;
  margin-top: -16px;
  margin-bottom: -16px;
  padding-top: 16px;
`;

const RowCollateral = styled.div`
  background-color: ${colors.colorWhite};
  margin-bottom: ${dimensions.unitSpacing}px;
  padding: 0px 20px 20px 30px;
  overflow: hidden;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.1);
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;

  i {
    color: ${colors.colorCoreGray};
  }

  &:hover {
    ${ActionButtons} {
      width: 35px;
    }
  }
`;

const CollateralColumn = styled.div`
  flex: 1;
`;

const CollateralField = styled.div`
  display: inline-block;
  padding-top: 20px;
  margin-right: 40px;
`;

const ScheduleItem = styled.div`
  display: inline-block;
  margin-right: 40px;
`;

const ItemValue = styledTS<{ nowrap?: boolean; fullLength?: boolean }>(
  styled.div
)`
  font-size: ${typography.fontSizeHeading8}px;
  text-align: ${props => (props.nowrap ? 'right' : 'left')};
  color: ${colors.colorCoreBlack};
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ${props => !props.fullLength && 'ellipsis'};
  padding-left: 5px;

  a {
    padding: 0;
    color: ${colors.linkPrimary};
  }

  span {
    float: right;
    margin-left: 5px;
  }

  ${props =>
    props.nowrap &&
    css`
      display: block;
      white-space: normal;
    `};
`;

const ItemLabel = styledTS<{ overflow?: string }>(styled.div)`
  white-space: nowrap;
  color: ${colors.colorCoreGray};
  overflow: ${props => (props.overflow ? props.overflow : 'hidden')};
  text-overflow: ellipsis;
  flex: 1;
`;

const ItemDesc = styledTS<{ overflow?: string }>(styled.div)`
  white-space: nowrap;
  color: ${colors.colorCoreGray};
  overflow: ${props => (props.overflow ? props.overflow : 'hidden')};
  text-overflow: ellipsis;
  flex: 1;
  padding-left: 5px;
`;

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const RemoveRow = styled.div`
  color: ${colors.colorCoreRed};

  &:hover {
    cursor: pointer;
  }
`;

const ExtraRow = styledTS<{ isDefault: boolean }>(styled.tr)`
  background: ${props => (props.isDefault ? '' : '#F7F8FC')};
`;

const ScrollTableColls = styled.div`
  overflow-x: scroll;
  overflow-y: hidden;
  width: 100%;
  white-space: nowrap;
`;

const TrRows = styled.tr``;

const TrNumberCols = styled.td`
  text-align: right;
`;

const ScheduleYears = styled.div`
  margin: 10px;
  margin-bottom: 5px;
`;

export {
  TrNumberCols,
  TrRows,
  InfoTitle,
  InfoDetail,
  Info,
  Action,
  Name,
  ContractsTableWrapper,
  CollateralLogo,
  List,
  FlexItem,
  DidAmount,
  WillAmount,
  ChooseColor,
  BackgroundSelector,
  ActionButtons,
  SidebarListItem,
  Description,
  Add,
  FooterInfo,
  FormContainer,
  CollateralTableWrapper,
  ScrollTableColls,
  Amount,
  CollateralButton,
  CollateralItemContainer,
  CollateralSettings,
  ContentColumn,
  ContentRow,
  ItemRow,
  ItemText,
  RowCollateral,
  CollateralColumn,
  CollateralField,
  ScheduleItem,
  ItemValue,
  ItemLabel,
  ItemDesc,
  NameWrapper,
  RemoveRow,
  ExtraRow,
  ScheduleYears,
  ChangeAmount,
  ExtraDebtSection
};
