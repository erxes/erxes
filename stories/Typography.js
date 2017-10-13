import React from "react";
import {
  fontSizeHeading1,
} from "../src/styles/typography";

import { Heading1, SmallText } from "./style";

function Typography() {
  return (
    <div>
      <h1>Typography</h1>

      <br /><br />

      <div>
        <SmallText>Heading 1 ({fontSizeHeading1})</SmallText>
        <Heading1>erxe is open source messaging platform</Heading1>
      </div>

      <br /><br />
    </div>
  );
}

export default Typography;
