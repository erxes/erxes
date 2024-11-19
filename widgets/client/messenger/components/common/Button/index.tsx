import * as React from "react";
import * as classNames from "classnames";

import { adjustBrightness, getColor } from "../../../utils/util";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  icon?: React.JSX.Element;
  full?: boolean;
  withDefaultStyle?: boolean;
  type?: "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  icon,
  full,
  withDefaultStyle,
  type = "button",
  className,
  ...buttonProps
}) => {
  const color = getColor();

  const style = color
    ? {
        background: `linear-gradient(
        119deg,
        ${adjustBrightness(color, 40)} 2.96%,
        ${adjustBrightness(color, -60)} 51.52%,
        ${color} 100.08%
      )`,
      }
    : {};

  const buttonClassNames = classNames(
    "base-button",
    {
      "main-button": withDefaultStyle || children,
      "w-full": full,
    },
    className
  );

  return (
    <button
      style={style}
      className={buttonClassNames}
      type={type}
      {...buttonProps}
    >
      {children}
      {icon}
    </button>
  );
};

export default Button;
