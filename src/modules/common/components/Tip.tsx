import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

type Props = {
  text?: string | React.ReactNode;
  children: React.ReactNode;
  placement?: string;
};

function Tip({ text, children, placement }: Props) {
  const tooltip = <Tooltip id="tooltip">{text}</Tooltip>;
  const placementValue = placement || 'top';

  return (
    <OverlayTrigger
      overlay={tooltip}
      placement={placementValue}
      delayShow={300}
      delayHide={150}
    >
      {children}
    </OverlayTrigger>
  );
}

export default Tip;
