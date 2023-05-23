import { colors, dimensions } from "../styles";

import styled from "styled-components";
import styledTS from "styled-components-ts";

export const LeftSidebar = styledTS<{ baseColor?: string }>(styled.div)`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 12px;
  padding: ${dimensions.coreSpacing}px;

  .header-info {
    h6 {
      margin: ${dimensions.coreSpacing}px 0 2px;
    }

    p {
      font-size: 14px;
      color: ${colors.colorCoreGray};
    }
  }

  .list {
    margin-top: ${dimensions.coreSpacing}px;
    font-size: 14px;

    a {
      height: 35px;
      
      &.selected {
        color: ${props => props.baseColor ? props.baseColor : colors.colorSecondary};
      }
    }
  }
`;

