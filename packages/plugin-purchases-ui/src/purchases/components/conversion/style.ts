import { colors, dimensions } from '@erxes/ui/src/styles';
import { MainContent } from '@erxes/ui/src/layout/styles';
import { Divider } from '@erxes/ui-settings/src/main/styles';
import styled, { css } from 'styled-components';
import styledTS from 'styled-components-ts';

const FixedContent = styled.div`
  position: relative;
  padding-top: 10px;
  width: 900px;
  margin: 0 auto;
`;

const PurchaseContent = styled(MainContent)`
  margin: 0;
`;

const StageWrap = styled.div`
  overflow: hidden;
  padding-bottom: 6px;
`;

const StageContainer = styledTS<{ spacing?: number }>(styled.div)`
  min-width: ${props => (props.spacing ? props.spacing : '100')}%;
  font-size: 12px;
  justify-content: space-between;
  float: right;
`;

const Content = styled('div')`
  background-color: rgb(255, 255, 255);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
  border-radius: 3px;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  align-items: center;
`;

const Stayed = styled('div')`
  border-left: 1px solid ${colors.borderPrimary};
  padding: 9px ${dimensions.coreSpacing}px;
  font-weight: 600;
  font-size: 18px;
  background: ${colors.bgLight};
  color: ${colors.colorCoreGray};
  flex-shrink: 0;

  span {
    color: ${colors.colorCoreDarkGray};
  }
`;

const Name = styled('div')`
  flex: 1;
  padding: ${dimensions.unitSpacing}px ${dimensions.coreSpacing}px;
  font-size: 14px;
  flex-shrink: 0;
`;

const Values = styled('div')`
  text-align: right;
  padding: 6px 10px 0 10px;
  font-weight: bold;
  color: ${colors.colorCoreGreen};
`;

const Lost = styled('span')`
  color: ${colors.colorCoreRed};
  margin-right: 10px;
`;

const Result = styled.div`
  text-align: right;
  font-weight: 500;
  font-size: 12px;
  padding: 5px 10px;
  color: ${colors.colorCoreGray};
`;

const TableView = styled.div`
  border-radius: 3px;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
  overflow: hidden;
  background: ${colors.colorWhite};
`;

const BodyRow = styled.div`
  display: flex;
  background: ${colors.colorWhite};

  > span {
    flex: 1;
    padding: 12px ${dimensions.coreSpacing}px;
    font-weight: 500;
    border-bottom: 1px solid ${colors.borderPrimary};

    label {
      color: ${colors.colorCoreGray};
      font-size: 85%;
    }
  }
`;

const HeadRow = styled(BodyRow)`
  background: ${colors.bgLight};
  position: sticky;
  margin: 0;

  > span {
    text-transform: uppercase;
    color: ${colors.colorCoreLightGray};
    font-weight: bold;
  }
`;

const StageName = styledTS<{ open?: boolean; isCollabsible?: boolean }>(
  styled.span
)`
  transition: all ease .3s;
  border-right: 1px solid transparent;

  ${props =>
    props.open &&
    css`
      font-weight: bold !important;
      background: ${colors.bgActive};
      border-color: ${colors.borderPrimary};
      border-top: 2px solid ${colors.colorCoreTeal};
      border-bottom: 2px solid transparent !important;
    `};
  
  ${props =>
    props.isCollabsible &&
    css`
      &:hover {
        cursor: pointer;
        background: ${colors.bgActive};
      }
    `};

  > i {
    margin-left: 5px;
    color: ${colors.colorSecondary};
    transition: all ease 0.3s;
    display: inline-block;
    transform: ${props => props.open && 'rotate(180deg)'};
  }
`;

const SubHead = styled(HeadRow)`
  background: ${colors.bgActive};
  margin: 0;
  font-size: 12px;

  > span {
    padding: 10px ${dimensions.coreSpacing}px;
    font-weight: 500;
  }
`;

const Purchases = styled.div`
  overflow: hidden;
  border-bottom: 3px solid ${colors.bgActive};
`;

const CenterButton = styled.div`
  text-align: center;
  margin: 10px;
`;

const ViewDivider = styled(Divider)`
  margin: ${dimensions.coreSpacing}px 0 ${dimensions.coreSpacing * 1.5}px;
  padding: 0;
`;

export {
  FixedContent,
  PurchaseContent,
  StageWrap,
  StageContainer,
  Content,
  Stayed,
  Name,
  Values,
  Lost,
  Result,
  HeadRow,
  BodyRow,
  SubHead,
  Purchases,
  TableView,
  StageName,
  CenterButton,
  ViewDivider
};
