import styled, { css } from 'styled-components';
import { colors, dimensions } from '@erxes/ui/src/styles/';

export const LoyaltyAmount = styled.div`
  font-weight: 500;
  line-height: 20px;
  padding: 0 0 5px 15px;
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
  text-align: center;
`;

export const PaddingTop = styled.div`
  padding-top: ${dimensions.unitSpacing}px;
`;

export const TriggerTabs = styled.div`
  .hxZkUW {
    border: 1px solid ${colors.borderPrimary};
    border-radius: 5px;
    padding: 2px;

    > span {
      flex: 1;
      flex-shrink: 0;
      text-align: center;
      font-weight: 500;
      padding: ${dimensions.unitSpacing - 4}px ${dimensions.coreSpacing}px
      border-radius: ${dimensions.unitSpacing - 5}px;

      &.active {
        background: ${colors.colorSecondary};
        color: ${colors.colorWhite};

        &:before {
          display: none;
        }
      }
    }
  }
`;

export const TableContainer = styled.div`
  width: 45%;
  border-radius: 5px;
  margin: 15px;
`;
export const AwardContainer = styled.div`
  display: flex;
  margin: 5px;
  flex-direction: row;
  text-align: center;
`;
export const Description = styled.div`
  text-align: center;
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

export const Card = styled.div`
  border-radius: 5px;
  box-shadow: 0 6px 10px 1px rgb(227 227 227);
  padding: ${dimensions.coreSpacing}px;
  width: 50px;
  height: 50px;
  margin: 12px;
  text-align: center;
`;

export const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding-top: ${dimensions.coreSpacing}px;

  @media (max-width: 1170px) {
    flex-direction: column;
    padding-left: ${dimensions.coreSpacing}px;
  }
`;

export const Badge = styled.div`
  border-radius: 15px;
  background-color: ${props => props.color};
  font-size: 11px;
  max-width: 50px;
  color: white;
  text-align: center;
`;

export const Column = styled.div`
  columns: 250px 2;
`;

export const CardBorder = styled.div`
  border: 2px solid rgb(161 161 161);
  border-radius: 3px;
  padding: 12px;
  margin: 12px;
`;

export const ClearBtnContainer = styled.a`
  padding: 0 0 0 15px;
`;
export const FilterRowContainer = styled.div`
display:grid;
grid-template-columns: 90% 10%
align-items:center
`;
export const Divider = styled.div`
  text-align: center;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: ${colors.colorCoreLightGray};
  margin: 20px 0;

  > span {
    margin: 0 20px;
    >footer {
      color ${colors.colorCoreBlack}
    }
  }

  &:before,
  &:after {
    content: '';
    flex: 1;
    height: 0;
    align-self: center;
    border-bottom: 1px solid ${colors.borderPrimary};
  }
`;
