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
  padding: 0;
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

const Sort = styled.div`
  position: relative;
  z-index: 2;
  padding: 10px 20px;
`;

const TableHead = styled.th`
  width: 50px;
`;

const FunnelContent = styled.div`
  background: ${colors.colorWhite};
  border-radius: 2px;
  box-shadow: 0 0 6px 1px ${colors.shadowPrimary};
`;

const Title = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

export {
  ScoreWrapper,
  CalculatedAmount,
  Amounts,
  Text,
  AmountItem,
  Factor,
  ScoreAmount,
  ContentContainer,
  LeftContent,
  RightContent,
  FixedContainer,
  Sort,
  ScrollContent,
  TableHead,
  FunnelContent,
  Title
};
