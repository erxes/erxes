import { colors, dimensions } from 'modules/common/styles';
import { rgba } from 'modules/common/styles/color';
import styled from 'styled-components';

const ScoreWrapper = styled.div``;

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
  padding: 20px;
`;

const Factor = styled.div`
  display: flex;
`;

const Denominator = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 2px solid ${colors.colorCoreDarkGray};

  input {
    max-width: 80px;
  }
`;

const Amount = styled.div`
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

  &:after {
    content: '\\ecdb';
    font-family: 'erxes';
    position: absolute;
    left: -17px;
    bottom: 7px;
    color: ${colors.colorCoreGray};
  }
`;

const CloseModal = styled.div`
  position: absolute;
  right: -40px;
  width: 30px;
  height: 30px;
  background: ${rgba(colors.colorBlack, 0.3)};
  line-height: 30px;
  border-radius: 15px;
  text-align: center;
  color: ${colors.colorWhite};

  &:hover {
    background: ${rgba(colors.colorBlack, 0.4)};
  }
`;

export {
  ScoreWrapper,
  CalculatedAmount,
  Amounts,
  Amount,
  CloseModal,
  Factor,
  Denominator
};
