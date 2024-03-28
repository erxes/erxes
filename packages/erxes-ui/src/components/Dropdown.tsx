import React, { useEffect, useRef, useState } from "react";
import { Menu } from "@headlessui/react";

type Props = {
  children: React.ReactNode;
  toggleComponent: React.ReactNode;
  as?: React.ElementType;
  drop?: string;
  active?: boolean;
  disabled?: boolean;
};

const Dropdown: React.FC<Props> = ({ children, as, drop, toggleComponent }) => {
  const [height, setHeight] = useState(0);
  const buttonRef = useRef({} as any);

  useEffect(() => {
    if (buttonRef.current.clientHeight) {
      setTimeout(() => {
        setHeight(buttonRef.current.clientHeight);
      }, 1000);
    }
  }, [buttonRef.current.clientHeight]);

  const style = drop === "up" ? { bottom: height + 5 } : {};

  return (
    <Menu as={as || "div"} className="relative dropdown-btn">
      <Menu.Button ref={buttonRef}>{toggleComponent}</Menu.Button>
      <Menu.Items className={`absolute`} style={style}>
        {children}
      </Menu.Items>
    </Menu>
  );
};

export default Dropdown;
