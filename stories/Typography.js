import React from "react";
import { typography } from "../src/modules/common/styles";

import { Heading1, SmallText } from "./style";

function Typography() {
  return (
    <div>
      <h1>Typography</h1>

      <br /><br />

      <div>
        <SmallText>Heading 1 ({typography.fontSizeHeading1})</SmallText>
        <Heading1>erxes is open source messaging platform </Heading1>
      </div>

      <br /><br />
    </div>
  );
}

export default Typography;
