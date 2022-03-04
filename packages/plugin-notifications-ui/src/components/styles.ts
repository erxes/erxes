import { dimensions } from "@erxes/ui/src/styles";
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
  padding: ${dimensions.coreSpacing}px 0 0 ${dimensions.coreSpacing}px;
`;
