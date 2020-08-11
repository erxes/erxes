import * as React from "react";
import { iconVideo } from "../../icons/Icons";
import { __ } from "../../utils";

type Props = {
  color?: string;
};

export default function VideoCallRequest({ color }: Props) {
  return (
    <div
      className="app-message-box spaced flexible"
      style={{ borderColor: color }}
    >
      <div className="user-info horizontal">
        {iconVideo()}
        <strong>{__("Call request sent")}</strong>
      </div>
    </div>
  );
}
