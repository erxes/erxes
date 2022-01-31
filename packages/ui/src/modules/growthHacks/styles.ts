import { ColorButton } from 'modules/boards/styles/common';
import { colors, dimensions } from 'modules/common/styles';
import { FixedContent } from 'modules/deals/components/conversion/style';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const ScoreWrapper = styled.div``;

const AddButton = `
  text-align: center;
  padding: 10px 20px;
  background: ${colors.bgLight};
  color: ${colors.textPrimary};
  border-top: 1px solid ${colors.borderPrimary};

  &:hover {
    background: ${colors.bgActive};
  }
`;

const CalculatedAmount = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${colors.colorPrimaryDark};
  margin-left: 40px;
  text-align: right;
  position: relative;

  &:after {
    content: '\\e945';
    font-family: 'erxes';
    position: absolute;
    left: -20px;
    color: ${colors.colorSecondary};
    font-size: 12px;
    display: none;
    top: 15px;
  }

  &:hover {
    cursor: pointer;

    &:after {
      display: block;
    }
  }
`;

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px 30px;
`;

const Factor = styled.div`
  display: flex;
`;

export interface IAmountItem {
  type?: string;
}

const AmountItem = styledTS<IAmountItem>(styled.div)`
  margin-left: ${dimensions.coreSpacing}px;
  position: relative;
  text-align: center;

  > span {
    text-transform: capitalize;
  }

  input {
    text-align: center;
  }

  &:nth-of-type(1) {
    color: ${colors.colorCoreRed};
    margin: 0;

    &:after {
      content: '';
    }
  }

  &:nth-of-type(2) {
    color: ${colors.colorCoreBlue};
  }

  &:nth-of-type(3) {
    color: ${colors.colorCoreGreen};
  }

  &:nth-of-type(4) {
    color: ${colors.colorCoreTeal};
  }

  &:nth-of-type(4):after {
    content: '\/';
    left: -10px;
  }

  &:after {
    ${props =>
      props.type === 'pie' ? "content: '\\ec2d'" : "content: '\\ecdb'"};
    font-family: 'erxes';
    position: absolute;
    left: -17px;
    bottom: 7px;
    color: ${colors.colorCoreGray};
  }
`;

const Text = styled.div`
  margin: 25px 0 0 10px;
`;

const ScoreAmount = styled.div`
  position: absolute;
  right: -3px;
  top: 5px;
  border-radius: 2px;
  background: #9a73b6;
  padding: 2px 6px;
  color: ${colors.colorWhite};
  font-weight: 500;
`;

const FixedContainer = styled(FixedContent)`
  flex: 1;
  background: ${colors.colorWhite};
  overflow: auto;
  padding-top: 0;
  margin: 10px auto;
  border-radius: 2px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
  display: flex;
  flex-direction: column;

  > a {
    ${AddButton}
  }
`;

const ScrollContent = styled.div`
  flex: 1;
  overflow: auto;

  .weighted-score-table-body {
    .with-input:last-child {
      background-color: ${colors.bgLightPurple};
      border-left: 1px solid ${colors.borderPrimary};
    }
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  background: ${colors.bgLight};
  overflow: auto;
  border-top: 1px solid ${colors.borderPrimary};
`;

const LeftContent = styled.div`
  flex: 1;
  background: ${colors.colorWhite};
  box-shadow: 0 0 6px 1px ${colors.shadowPrimary};
  z-index: 2;
  overflow: auto;
  display: flex;
  flex-direction: column;

  > a {
    ${AddButton}
  }
`;

const RightContent = styled.div`
  flex: 2;
  padding: 20px 80px 40px 80px;
  overflow: hidden;
`;

const TableHead = styled.th`
  width: 50px;

  &:last-child {
    background-color: ${colors.bgLightPurple};
    border-left: 1px solid ${colors.borderPrimary};
  }
`;

const FunnelContent = styled.div`
  background: ${colors.bgLight};
  border: 1px solid ${colors.borderPrimary};
  margin: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  border-radius: ${dimensions.unitSpacing - 6}px;
  overflow: hidden;

  &:first-child {
    margin-top: 20px;
  }

  &:last-child {
    margin-bottom: 20px;
  }
`;

const Title = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px
    ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  i {
    font-size: 14px;
  }

  > span {
    font-size: 11px;
    color: ${colors.colorCoreGray};

    b {
      margin-left: 2px;
    }
  }
`;

const TableContainer = styled.div`
  background: ${colors.colorWhite};
  border-top: 1px solid ${colors.borderPrimary};
`;

const GrowthRow = styled.tr`
  td {
    &:first-child {
      min-width: 250px;
      max-width: 250px;
    }

    &:first-child {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &:last-child {
      max-width: 100px;
    }
  }
`;

const Vote = styled.div`
  i {
    margin-right: 5px;
  }
`;

const VotersContent = styled.div`
  padding: ${dimensions.unitSpacing}px ${dimensions.unitSpacing}px
    ${dimensions.unitSpacing}px 0;

  img,
  span {
    margin-left: -1px;
  }
`;

const VotersCount = styled(ColorButton)`
  display: inline-block;
`;

const BottomAction = styled.div`
  border-top: 1px solid ${colors.borderPrimary};

  a {
    display: block;
    padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
    background: ${colors.bgLight};
    font-weight: 500;
  }
`;

const FilterList = styled.ul`
  display: flex;
  padding-left: 0;
  list-style: none;
`;

const FilterListItem = styledTS<{ isActive: boolean }>(styled.li)`
  margin: 0 ${dimensions.unitSpacing / 2}px;
  a{
    color: ${props =>
      props.isActive ? colors.colorWhite : colors.textSecondary};
    padding: ${dimensions.unitSpacing / 2}px; ${dimensions.unitSpacing}px;;
    border: 1px solid ${colors.borderDarker};
    background: ${props => props.isActive && colors.colorSecondary};
  }
`;

const ContentTitle = styled.h3`
  font-size: 12px;
  text-transform: uppercase;
  margin: 0;
`;

export {
  ScoreWrapper,
  CalculatedAmount,
  GrowthRow,
  TableContainer,
  Amounts,
  Text,
  AmountItem,
  Factor,
  ScoreAmount,
  ContentContainer,
  LeftContent,
  RightContent,
  FixedContainer,
  ScrollContent,
  TableHead,
  FunnelContent,
  Title,
  Vote,
  VotersContent,
  VotersCount,
  FilterList,
  FilterListItem,
  ContentTitle,
  BottomAction
};
