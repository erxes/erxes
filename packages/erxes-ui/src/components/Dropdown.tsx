import React, { forwardRef, useEffect, useRef, useState } from "react";

import { Menu } from "@headlessui/react";

type Props = {
  children: React.ReactNode;
  toggleComponent: React.ReactNode;
  as?: React.ElementType;
  drop?: string;
  active?: boolean;
  disabled?: boolean;
  isMenuWidthFit?: boolean;
};

const Dropdown: React.FC<Props> = forwardRef<HTMLDivElement, Props>(
  ({ children, as, drop, toggleComponent, isMenuWidthFit }, ref) => {
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>({} as any);

    useEffect(() => {
      if (buttonRef.current) {
        setHeight(buttonRef.current.clientHeight);
        setWidth(buttonRef.current.clientWidth);
      }
    }, [buttonRef.current]);

    const style =
      drop === "up" ? { bottom: height + 5 } : width !== 0 ? { width } : {};

    // const MenuButton = React.forwardRef(function (props, ref) {
    //   return toggleComponent;
    // });

    return (
      <Menu as={as || "div"} className="relative dropdown-btn">
        {({ open }) => (
          <>
            <Menu.Button ref={buttonRef}>{toggleComponent}</Menu.Button>
            {/* <Menu.Button ref={buttonRef} as={MenuButton} /> */}
            {open && (
              <Menu.Items ref={ref} className={`absolute ${isMenuWidthFit && 'menuWidthFit'}`} style={style}>
                {children}
              </Menu.Items>
            )}
          </>
        )}
      </Menu>
    );
  }
);

export default Dropdown;
