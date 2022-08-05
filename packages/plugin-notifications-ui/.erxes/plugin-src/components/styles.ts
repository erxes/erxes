import { colors, dimensions } from "@erxes/ui/src/styles";
import styled from "styled-components";

export const InlineItems = styled.div`
  display: flex;
  margin-bottom: ${dimensions.unitSpacing}px;
  align-items: center;
  justify-content: space-between;

  > div {
    margin-right: ${dimensions.unitSpacing}px;
  }
`;

export const ModuleBox = styled.div`
  padding-bottom: ${dimensions.coreSpacing}px;
`;

export const Box = styled.div`
  padding: ${dimensions.coreSpacing}px;
  padding-bottom: 0;
  background: ${colors.colorWhite};
  margin-bottom: ${dimensions.unitSpacing}px;

  &:last-of-type {
    margin: 0;
  }
`;
