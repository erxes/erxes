import styled, { css } from "styled-components";
import styledTS from "styled-components-ts";
import { colors, dimensions } from "@erxes/ui/src/styles/";
import { rgba } from "@erxes/ui/src/styles/ecolor";
import { SidebarList } from "@erxes/ui/src/layout/styles";

export const CustomRangeContainer = styled.div`
  display: flex;
  align-items: flex-end;
  > div {
    flex: 1;
    margin-right: 8px;
    input[type="text"] {
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

export const FilterContainer = styled.div`
  padding: 10px 20px;
`;

export const ExtraButtons = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 0;

  > div {
    cursor: pointer;
  }
`;

export const BoxContainer = styled(SidebarList)`
  padding-top: 10px;

  > li,
  > a > li {
    padding: 6px 0 !important;
  }

  > a {
    padding: 0;
    font-weight: 500;
  }
`;

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
  margin: 0 auto;
  text-align: center;
`;

export const PaddingTop = styledTS<{ padding?: number }>(styled.div)`
  padding-top: ${({ padding }) => (padding ? `${padding + dimensions.unitSpacing}px` : `${dimensions.unitSpacing}px`)} ;
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

export const Row = styledTS<{ $justifyContent?: string }>(styled.div)`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding-top: ${dimensions.coreSpacing}px;
  ${({ $justifyContent }) => ($justifyContent ? `justify-content: ${$justifyContent};` : "")}

  @media (max-width: 1170px) {
    flex-direction: column;
    padding-left: ${dimensions.coreSpacing}px;
  }
`;

export const Badge = styled.div`
  border-radius: 15px;
  background-color: ${(props) => props.color};
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
export const Indicator = styledTS<{ color: string }>(styled.div)`
  border-radius: 50%;
  width: 10px; 
  height: 10px;
  background: ${(props) => props.color}
`;

export const FormFooter = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
`;

export const OwnerBox = styledTS<{
  $isSelected?: boolean;
  isWithActions?: boolean;
}>(styled.div)`
  display: flex;
  flex-direction: row;
  gap: 5px;
  align-items: center;
  padding: 4px 12px;
  color: ${colors.colorCoreGray};
  cursor: pointer;
  box-shadow: ${(props) =>
    props.$isSelected
      ? `0 10px 20px ${rgba(colors.colorCoreDarkGray, 0.12)}`
      : `0 6px 10px 1px ${rgba(colors.colorCoreDarkGray, 0.08)}`} ;
  border-radius: ${dimensions.unitSpacing / 2 - 1}px;
  transition: all 0.25s ease;
  border: 1px solid
    ${(props) =>
      props.$isSelected ? colors.colorSecondary : "rgba(0, 0, 0, 0.12)"};
    
  > span {
   font-weight: 600;
  }

  ${({ isWithActions }) =>
    isWithActions
      ? `
      > *:last-child {
      margin-left: auto;
    }
    `
      : ``}

`;

export const AttributeTrigger = styled.span`
  color: ${colors.colorSecondary};
  font-weight: 500;
`;

export const Attributes = styled.ul`
  list-style: none;
  margin: 0;
  right: 20px;
  max-height: 200px;
  min-width: 200px;
  overflow: auto;
  padding: ${dimensions.unitSpacing}px;
  border-radius: ${dimensions.unitSpacing - 5}px;

  > div {
    padding: 0;
  }

  b {
    margin-bottom: ${dimensions.unitSpacing + 10}px;
    color: black;
  }

  li {
    color: ${colors.colorCoreGray};
    padding-bottom: ${dimensions.unitSpacing - 5}px;
    cursor: pointer;
    font-weight: 400;
    transition: all ease 0.3s;

    &:hover {
      color: ${colors.textPrimary};
    }
  }
`;
