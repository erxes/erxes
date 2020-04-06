import * as React from "react";

type Props = {
  color: string;
  title: string;
};

function TopBar({ title, color }: Props) {
  return (
    <div className="erxes-topbar thiner" style={{ backgroundColor: color }}>
      <div className="erxes-middle">
        <div className="erxes-topbar-title">
          <div>{title}</div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
