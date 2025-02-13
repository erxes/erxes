import * as React from "react";

import { defaultAvatar } from "../../../icons/Icons";
import { readFile } from "../../../utils";

function Bot() {
  return (
    <div className="erxes-avatar top">
      <img src={readFile(defaultAvatar)} alt="avatar" />
    </div>
  );
}

export default Bot;
