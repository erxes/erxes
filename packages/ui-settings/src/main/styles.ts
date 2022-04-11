import { colors, dimensions, typography } from "@erxes/ui/src/styles";
import { darken } from "@erxes/ui/src/styles/ecolor";
import { BoxRoot } from "@erxes/ui/src/styles/main";
import styled from "styled-components";
import styledTS from "styled-components-ts";

const columnTitleSize = 300;
const boxSize = 150;

const MenusContainer = styled.div`
  padding: ${dimensions.coreSpacing}px ${dimensions.headerSpacing}px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  padding-top: ${dimensions.coreSpacing}px;

  @media (max-width: 1170px) {
    flex-direction: column;
    padding-left: ${dimensions.coreSpacing}px;
  }
`;

const RowTitle = styled.h3`
  font-size: ${typography.fontSizeHeading8 + 1}px;
  font-weight: ${typography.fontWeightMedium};
  text-transform: uppercase;
  margin: 0 0 ${dimensions.coreSpacing}px;
  color: ${colors.colorCoreDarkGray};
  flex-shrink: 0;
  align-self: center;
  width: ${columnTitleSize}px;

  > span {
    text-transform: initial;
    display: block;
    color: ${colors.colorCoreGray};
    margin-top: ${dimensions.unitSpacing - 5}px;
    font-weight: normal;
    max-width: ${columnTitleSize - 40}px;
    line-height: 1.4;
  }

  @media (max-width: 1170px) {
    align-self: flex-start;
  }
`;

const PluginSettings = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
`;

const Box = styledTS<{ color?: string }>(styled(BoxRoot))`
  width: ${boxSize + dimensions.coreSpacing}px;
  height: ${boxSize}px;
  border-color: transparent;
  background: ${colors.colorWhite};
  position: relative;

  img {
    height: 83px;
  }

  > a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;

    > em {
      background: ${(props) =>
        props.color ? props.color : colors.colorCoreGreen};
      border-radius: 3px;
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      padding: 0 ${dimensions.unitSpacing - 5}px;
      position: absolute;
      right: ${dimensions.unitSpacing - 5}px;
      top: ${dimensions.unitSpacing - 5}px;
      text-transform: uppercase;
    }

    &:focus {
      text-decoration: none;
    }
  }

  &.hasBorder {
    border-bottom: ${dimensions.unitSpacing - 7}px solid ${(props) =>
  props.color ? props.color : colors.colorCoreGreen}};
  }
`;

const Divider = styled.div`
  border-bottom: 1px dotted ${darken(colors.borderPrimary, 5)};
  padding-bottom: ${dimensions.coreSpacing}px;
  margin: 0 ${dimensions.coreSpacing}px ${dimensions.coreSpacing}px
    ${columnTitleSize}px;

  @media (max-width: 1170px) {
    margin-left: ${dimensions.coreSpacing}px;
  }
`;

const BoxName = styled.span`
  font-size: ${typography.fontSizeUppercase}px;
  margin: 0 !important;
`;

export { Row, RowTitle, Box, Divider, BoxName, MenusContainer, PluginSettings };
