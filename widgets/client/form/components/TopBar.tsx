import * as React from "react";
import { __ } from "../../utils";

type Props = {
  color: string;
  title: string;
};

function TopBar({ title, color }: Props) {
  return (
    <div className="erxes-topbar thiner" style={{ backgroundColor: color }}>
      <div className="erxes-middle">
        <div className="erxes-topbar-title">
          <div>{__(title)}</div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
