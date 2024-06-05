import React from "react";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import { ILog } from "../../types";
import { FormControl } from "@erxes/ui/src/components/form";
import { colors, dimensions } from "@erxes/ui/src/styles";
import dayjs from "dayjs";
const ZmsNameStyled = styledTS<{ checked: boolean }>(styled.div).attrs({})`
    color: ${colors.colorCoreBlack};
    text-decoration: ${(props) => (props.checked ? "line-through" : "none")}
    `;

export const ZmsWrapper = styledTS<{ space: number }>(
  styled.div
)`padding-left: ${(props) => props.space * 20}px;
  display:inline-flex;
  justify-content:flex-start;
  align-items: center;
`;

const Margin = styledTS(styled.div)`
 margin: ${dimensions.unitSpacing}px;
`;

type Props = {
  log: ILog;
  space: number;
};

type State = {
  checked: boolean;
};

function Logs({ log, checked }) {
  return <ZmsNameStyled checked={checked}></ZmsNameStyled>;
}

class Row extends React.Component<Props, State> {
  render() {
    const { log, space } = this.props;
    return (
      <tr>
        <td>
          <ZmsWrapper space={space}>
            <FormControl
              componentclass="checkbox"
              color={colors.colorPrimary}
              defaultChecked={log.checked || false}
            ></FormControl>
            <Margin>
              <Logs log={log} checked={log.checked || false} />
            </Margin>
          </ZmsWrapper>
        </td>
        <td>
          <ZmsNameStyled checked={false}>
            {dayjs(log.createdAt).format("lll")}
          </ZmsNameStyled>
        </td>
        <td>
          <ZmsNameStyled checked={false}>{log.status}</ZmsNameStyled>
        </td>
        <td>
          <ZmsNameStyled checked={false}>{log.action}</ZmsNameStyled>
        </td>
        <td></td>
      </tr>
    );
  }
}
export default Row;
