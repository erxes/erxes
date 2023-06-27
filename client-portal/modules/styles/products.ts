import styled from "styled-components";
import styledTS from "styled-components-ts";
import colors from "./colors";
import dimensions from "./dimensions";

const SectionBodyItem = styled.div`
  border-bottom: 1px solid ${colors.borderPrimary};
  word-break: break-word;
  > a {
    padding: 10px 20px;
    display: flex;
    width: 100%;
    color: ${colors.textSecondary};
    &:hover {
      text-decoration: underline;
    }
  }
  > span {
    display: block;
    padding: 0px 20px 10px 20px;
    margin-top: -10px;
  }
  ul li {
    margin-left: ${dimensions.coreSpacing}px;
  }
`;

export { SectionBodyItem };
