import React from "react";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

type Props = {
  text?: string | React.ReactNode;
  children: React.ReactNode;
  placement?:
    | "auto-start"
    | "auto"
    | "auto-end"
    | "top-start"
    | "top"
    | "top-end"
    | "right-start"
    | "right"
    | "right-end"
    | "bottom-end"
    | "bottom"
    | "bottom-start"
    | "left-end"
    | "left"
    | "left-start";
};

function Tip({ text, children, placement }: Props) {
  const tooltip = <Tooltip id="tooltip">{text}</Tooltip>;
  const placementValue = placement || "auto";

  return (
    <OverlayTrigger
      overlay={tooltip}
      placement={placementValue}
      delay={{ show: 250, hide: 250 }}
    >
      {children}
    </OverlayTrigger>
  );
}

export default Tip;
