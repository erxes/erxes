import { dimensions, colors, ContentHeader } from '@erxes/ui/src';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

export const LoyaltyAmount = styled.div`
  font-weight: 800;
  line-height: 20px;
  padding-left: 15px;
  display: flex;
  position: relative;
  flex-direction: row;
  transition: all ease 0.3s;
`;

export const SettingsContent = styled.div`
  padding: 30px;
`;

export const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;

export const Description = styled.div`
  color: ${colors.colorCoreGray};
  font-size: 12px;
`;

export const LinkButton = styled.a`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  overflow: hidden;
  align-items: center;
  transition: all 0.3s ease;
  float: right;

  * {
    padding: 0;
    margin-left: ${dimensions.unitSpacing}px;

    &:first-child {
      margin-left: 0;
    }
  }
`;

export const FinanceAmount = styled.div`
  float: right;
`;

export const Actions = styled.div`
  float: right;
`;

export const RowTitle = styled.div`
  > a {
    color: ${colors.textPrimary};
  }

  &:hover {
    text-decoration: underline;
    color: ${colors.colorBlack};
    cursor: pointer;
  }
`;

export const Content = styled.div`
  display: flex;
  height: 100%;
  overflow: hidden;

  > form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
`;

export const LeftContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const TabletPreview = styled.div`
  background: url('/images/previews/tablet.png') no-repeat center center;
  width: 768px;
  height: 1024px;
  margin: 0 auto;
  padding: 80px ${dimensions.coreSpacing}px;
  margin-top: ${dimensions.coreSpacing}px;
`;

const PreviewContainer = styled.div`
  position: relative;
  height: 100%;
  padding: 20px;
`;

export const PreviewWrapper = styled.div`
  width: 40%;
  background: ${colors.colorWhite};
  margin-left: 5px;

  ${TabletPreview} {
    background-size: contain;
    width: 85%;
    height: 100%;

    ${PreviewContainer} {
      max-height: 600px;
    }

    @media (max-width: 1400px) {
      padding: 40px 10px;
    }
  }
`;

export const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
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

export const FlexColumn = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;

  ${ContentHeader} {
    border-bottom: none;
    border-top: 1px solid ${colors.borderPrimary};
  }
`;

export const FlexItem = styled.div`
  display: flex;
  height: 100%;
`;

export const Row = styled.div`
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

export const DomainRow = styled.div`
  background: ${colors.bgLight};
  border-radius: 4px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid ${colors.borderPrimary};
`;

export const ClickableRow = styled.div`
  cursor: pointer;

  &:hover {
    color: ${colors.textSecondary};
  }
`;

export const ColorPick = styled.div`
  border-radius: 4px;
  display: inline-block;
  padding: 3px;
  border: 1px solid ${colors.borderDarker};
  cursor: pointer;
`;

export const ColorPicker = styled.div`
  width: 80px;
  height: 27px;
  border-radius: 2px;
`;

export const ColorPickerWrap = styled.div`
  display: flex;
  flex: 1;
  margin-top: ${dimensions.unitSpacing}px;

  > div {
    padding-right: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
    margin-bottom: 0;
  }
`;

export const ColorChooserTile = styled.div`
  margin-bottom: ${dimensions.unitSpacing - 5}px;
  font-size: 12px;
`;

export const SubItem = styled.div`
  margin-bottom: ${dimensions.coreSpacing}px;

  img {
    background-color: ${colors.colorLightGray};
    max-height: 100px;
    margin-right: 5px;
  }

  i:hover {
    cursor: pointer;
  }

  label {
    display: block;
    margin-bottom: 10px;
  }
`;

export const WidgetBackgrounds = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
`;

export const AppearanceRow = styled.div`
  display: flex;
  flex-direction: row;
  margin: 10px;
`;

export const FullPreview = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${dimensions.coreSpacing}px;
  overflow: auto;
`;

export const DesktopPreview = styled.div`
  background: url('/images/previews/desktop.png') no-repeat;
  background-size: cover;
  border: 1px solid ${colors.borderPrimary};
  border-radius: ${dimensions.unitSpacing / 2}px;
  flex: 1;
  overflow: auto;
  padding-top: ${dimensions.headerSpacing - 20}px;
  margin-top: ${dimensions.coreSpacing}px;
`;

export const Block = styled.div`
  border-bottom: 1px dashed ${colors.borderPrimary};
  margin-bottom: ${dimensions.coreSpacing + dimensions.unitSpacing}px;
  padding-bottom: ${dimensions.unitSpacing}px;

  .Select {
    min-width: 300px;
  }

  > h4 {
    margin-bottom: ${dimensions.coreSpacing}px;
    color: ${colors.colorPrimary};
  }
`;

export const FlexRow = styled.div`
  flex: 1;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;

  > div:first-child {
    padding-right: ${dimensions.coreSpacing}px;
  }
`;

export const DetailRow = styled(FlexRow)`
  justify-content: space-around;
`;

export const LogoWrapper = styled.div`
  width: ${dimensions.coreSpacing - 5}%;
`;

export const BlockRow = styled(FlexRow)`
  align-items: center;
  margin-bottom: ${dimensions.unitSpacing}px;

  > label {
    margin-right: 10px;
  }

  > div {
    padding-right: ${dimensions.coreSpacing}px;
    width: 33%;

    &.description {
      width: 50%;
    }

    .jJKBbS {
      margin: 0;
    }

    @media (max-width: 1250px) {
      flex: 1;
    }
  }
`;

export const BlockRowUp = styled(BlockRow)`
  align-items: self-start;
`;

export const TableWrapper = styled.div`
  td {
    max-width: 250px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const FilterBox = styled.div`
  text-align: left;
  .Select {
    margin-bottom: 15px;
  }

  input {
    margin-bottom: 20px;
  }

  .input-container {
    width: 50%;
  }
`;

export const CustomRangeContainer = styled.div`
  display: flex;

  > div {
    flex: 1;

    &:last-child {
      margin-left: 5px;
    }
  }

  input {
    max-width: 175px;
  }

  .filterDate {
    max-width: 50%;
  }
`;

export const FilterButton = styledTS<{ selected?: boolean }>(styled.div)`
  padding: 5px 20px;
  background: ${props =>
    props.selected ? colors.colorSecondary : colors.bgActive};
  color: ${props =>
    props.selected ? colors.colorWhite : colors.textSecondary};
  line-height: 20px;
  width: 100%;
  margin-bottom: 10px;
  position: relative;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;

  &:hover {
    background: ${props =>
      props.selected ? colors.colorPrimaryDark : colors.bgGray};
    cursor: pointer;
  }
`;

export const RightMenuContainer = styled.div`
  position: fixed;
  z-index: 2;
  top: 100px;
  right: 0;
  bottom: 0;
  width: 400px;
  background: ${colors.bgLight};
  white-space: normal;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 24px -6px rgba(9, 30, 66, 0.25),
    0 0 0 1px rgba(9, 30, 66, 0.08);
`;

export const TabContent = styled.div`
  padding: 15px 20px 0px 20px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
`;

export const MenuFooter = styled.footer`
  display: flex;
  padding: 10px 20px;
  max-width: 95%;
`;
