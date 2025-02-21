import { TabCaption, TabContainer } from "@erxes/ui/src/components/tabs/styles";
import { colors, dimensions } from "@erxes/ui/src/styles";

import { rgba } from "@erxes/ui/src/styles/ecolor";
import styled from "styled-components";
import styledTS from "styled-components-ts";

const FilterBox = styled.div`
  .css-13cymwt-control, .css-t3ipsp-control {
    margin-bottom: 15px;
  }

  input {
    margin-bottom: 20px;
  }
`;

const CustomRangeContainer = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
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

const FilterButton = styledTS<{ selected?: boolean }>(styled.div)`
  padding: 5px 20px;
  background: ${(props) =>
    props.selected ? colors.colorSecondary : colors.bgActive};
  color: ${(props) =>
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
    background: ${(props) =>
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
  width: 300px;
  background: ${colors.bgLight};
  white-space: normal;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 12px 24px -6px rgba(9, 30, 66, 0.25),
    0 0 0 1px rgba(9, 30, 66, 0.08);

  ${TabContainer} {
    height: 40px;
  }

  ${TabCaption} {
    padding: 10px 20px;
  }
`;

const RightDrawerContainer = styledTS<{ width?: string } & any>(
  styled(RightMenuContainer),
)`
  background: ${colors.colorWhite};
  width: ${(props) =>
    props.width ? props.width : '500px'};
  z-index: 10;
  top: 0;
`;

const EditFormContent = styled.div`
  height: 100%;
`;

export const TabContent = styled.div`
  padding: 15px 20px 20px 20px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
`;

const MenuFooter = styled.footer`
  padding: 10px 20px;
`;

const ArchiveWrapper = styled.div`
  height: 100%;
  height: calc(100% - 60px);
`;

const TopBar = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: flex-end;

  > span {
    flex: 1;
    margin-right: 10px;

    input[type="text"] {
      width: 100%;
    }
  }
`;

const ItemContainer = styled.div`
  margin-bottom: 20px;

  > span {
    text-decoration: underline;
    color: ${colors.colorCoreGray};

    &:hover {
      cursor: pointer;
      color: ${colors.textSecondary};
    }
  }
`;

const LoadMore = styled.span`
  text-decoration: underline;
  margin-bottom: 10px;
  color: ${colors.colorCoreGray};
  display: block;
  text-align: center;

  > i {
    margin-right: 5px;
  }

  &:hover {
    cursor: pointer;
    color: ${colors.textSecondary};
  }
`;

const BoardItem = styled.div`
  box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;
  padding: 8px 10px;
  outline: 0px;
  margin-bottom: 5px;
  border-radius: 4px;
  background: ${colors.colorWhite};
  font-weight: 500;
`;

const TopHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${dimensions.unitSpacing}px;
  border-bottom: 1px solid ${colors.borderPrimary};

  > span {
    color: ${colors.colorCoreBlueGray};
    font-weight: 700;
  }

  .right {
    display: flex;
    gap: ${dimensions.unitSpacing}px;

    .menuWidthFit {
      right: ${dimensions.unitSpacing}px;

      button {
        padding: 0;
      }
    }
  }
`;

const TopHeaderButton = styled.div`
  width: 30px;
  height: 30px;
  background: ${rgba(colors.colorBlack, 0.3)};
  line-height: 30px;
  border-radius: 15px;
  text-align: center;
  color: ${colors.colorWhite};

  &:hover {
    background: ${rgba(colors.colorBlack, 0.4)};
    cursor: pointer;
  }
`;

export {
  FilterBox,
  FilterButton,
  MenuFooter,
  TopBar,
  ItemContainer,
  LoadMore,
  CustomRangeContainer,
  BoardItem,
  ArchiveWrapper,
  RightDrawerContainer,
  EditFormContent,
  TopHeader,
  TopHeaderButton,
};
