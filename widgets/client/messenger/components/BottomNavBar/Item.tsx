import * as React from "react";

import { IconProps } from "./Icons";
import { m } from "framer-motion";
import useHover from "../../hooks/useHover";

type Props = {
  label?: string;
  icon: (props: IconProps) => React.ReactNode;
  isActive: boolean;
  handleClick: (route: string) => (event: React.MouseEvent) => void;
  route: string;
};

const Item: React.FC<Props> = ({
  label,
  icon,
  isActive,
  handleClick,
  route,
}) => {
  const [hoverRef, isHovered] = useHover();

  const renderIcon = () => {
    return icon({ filled: isActive || isHovered });
  };

  const renderLabel = () => {
    if (!label || (!isActive && !isHovered)) return null;

    return <span className="nav-label">{label}</span>;
  };

  return (
    <m.li
      ref={hoverRef}
      className={`nav-item ${isActive ? "active" : ""} `}
      onClick={handleClick(route)}
    >
      <m.div className="nav-content">
        {renderIcon()}
        {renderLabel()}
      </m.div>
    </m.li>
  );
};

export default Item;
