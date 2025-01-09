import styled from "styled-components";
import { dimensions, colors } from "@erxes/ui/src/styles";
import { HeaderContent } from "@erxes/ui-sales/src/boards/styles/item";

export const ScrolledContent = styled.div`
  flex: 1;
  overflow: auto;
`;

export const BoardHeader = styled(HeaderContent)`
  .header-row {
    display: flex;
    justify-content: space-between;

    > div > span {
      color: ${colors.colorSecondary};
      font-weight: 500;
      cursor: pointer;
      margin-left: ${dimensions.unitSpacing}px;
    }
  }
`;

export const DrawerDetail = styled.div`
  padding: ${dimensions.coreSpacing}px;
  border: 1px solid ${colors.borderPrimary};
  border-radius: 5px;
`;

export const BackButton = styled.div`
  width: 35px;
  height: 35px;
  border-radius: 35px;
  line-height: 35px;
  background: rgba(0, 0, 0, 0.12);
  text-align: center;
  margin-right: ${dimensions.unitSpacing}px;
  color: ${colors.textPrimary};
  transition: all ease 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.18);
  }
`;

export const BackIcon = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: ${dimensions.unitSpacing}px 0;
  font-weight: 500;

  > i {
    width: 24px;
    height: 24px;
    border-radius: 24px;
    line-height: 24px;
    text-align: center;
    margin-right: ${dimensions.unitSpacing - 5}px;
    background: #f5f5f5;
    color: ${colors.colorPrimary};
    transition: all ease 0.3s;
  }

  &:hover {
    i {
      box-shadow: 0 0 2px 0 rgba(101, 105, 223, 0.4);
    }
  }
`;

export const ItemRowHeader = styled.h5`
  display: flex;
  flex-direction: column;

  > span {
    font-size: 11px;
    color: ${colors.colorLightGray};
  }
`;
