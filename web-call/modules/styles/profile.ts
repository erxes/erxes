import { colors, dimensions } from "../styles";

import styled from "styled-components";
import styledTS from "styled-components-ts";

export const LeftSidebar = styledTS<{ baseColor?: string }>(styled.div)`
  border: 1px solid ${colors.borderPrimary};
  border-radius: 12px;
  padding: ${dimensions.coreSpacing}px;
  background: ${colors.colorWhite};
  
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

export const LeftContent = styled.div`
  box-shadow: 0 0 3px rgb(60 72 88 / 0.15);
  border-radius: 0.375rem;
  background: ${colors.colorWhite};
`;

export const SettingsTitle = styled.h5`
  padding: ${dimensions.coreSpacing}px;
  margin: 0;
  border-bottom: 1px solid ${colors.borderPrimary};
`;

export const SettingsContent = styled.div`
  padding: ${dimensions.coreSpacing}px;

  #toggle-check {
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 5px;
    border-color: ${colors.colorCoreGray};
    color: #666;

    &:hover, &.active {
      background-color: ${colors.colorWhite};
    }

    &:focus, &.active {
      outline: 0;
      box-shadow: none;
    }
  }
`;

