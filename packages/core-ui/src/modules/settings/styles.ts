import { colors, dimensions } from "modules/common/styles";
import { rgba } from "modules/common/styles/color";
import { DateContainer } from "modules/common/styles/main";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import { ActionButtons } from "@erxes/ui-settings/src/styles";
import { lighten } from "@erxes/ui/src/styles/ecolor";

const coreSpace = `${dimensions.coreSpacing}px`;
const unitSpace = `${dimensions.unitSpacing}px`;

const ModuleBox = styled.div`
  padding: ${coreSpace} 0 0 ${coreSpace};
`;

const WidgetApperance = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  min-height: 100%;
  padding: ${coreSpace};
`;

const InlineItems = styled.div`
  display: flex;
  margin-bottom: ${unitSpace};
  align-items: center;
  justify-content: space-between;

  > div {
    margin-right: ${unitSpace};
  }
`;

const BackgroundSelector = styled.div`
  border: 3px solid transparent;
  margin-right: 15px;
  border-radius: 4px;
  transition: border-color 0.3s;

  > div {
    width: 80px;
    height: 40px;
    margin: 5px;
    border: 1px solid ${colors.borderDarker};
    background-repeat: repeat;
    background-position: 0 0;
    background-size: 220%;

    &.background-1 {
      background-image: url("/images/patterns/bg-1.png");
    }

    &.background-2 {
      background-image: url("/images/patterns/bg-2.png");
    }

    &.background-3 {
      background-image: url("/images/patterns/bg-3.png");
    }

    &.background-4 {
      background-image: url("/images/patterns/bg-4.png");
    }

    &.background-5 {
      background: #faf9fb;
    }
  }

  &.selected {
    border-color: ${colors.borderDarker};
  }

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    cursor: pointer;
  }
`;

const SidebarListItem = styledTS<{ isActive: boolean }>(styled.li)`
  position: relative;
  background: ${(props) => props.isActive && rgba(colors.colorPrimary, 0.2)};
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;

  a {
    white-space: normal;
    flex: 1;
    color: ${(props) => props.isActive && colors.colorPrimary};
    font-weight: ${(props) => props.isActive ? 600 : 500};

    border-bottom: 1px solid ${colors.borderPrimary};

    margin: 0 20px;
    padding: 10px 0;

    &:hover {
      background: none;
      color: ${(props) => !props.isActive && lighten(colors.textPrimary, 40)};
    }

    &:focus {
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
    background: ${(props) => !props.isActive && colors.bgLight};

    ${ActionButtons} {
      width: 35px;
    }
  }
`;

const FlexItem = styled(DateContainer)`
  flex: 1;
  margin: 0;
  margin-left: ${dimensions.coreSpacing}px;

  &:first-child {
    margin-left: 0;
  }
`;

export {
  FlexItem,
  ModuleBox,
  InlineItems,
  WidgetApperance,
  BackgroundSelector,
  SidebarListItem,
};
