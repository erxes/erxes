import React, { forwardRef, useEffect, useRef, useState } from "react";

import Dialog from "@erxes/ui/src/components/Dialog";
import { Menu } from "@headlessui/react";

type IModalMenuItems = {
  title: string;
  trigger: React.ReactNode;
  content: any;
  additionalModalProps?: any;
};

type Props = {
  children?: React.ReactNode;
  toggleComponent: React.ReactNode;
  as?: React.ElementType;
  drop?: string;
  active?: boolean;
  disabled?: boolean;
  isMenuWidthFit?: boolean;
  unmount?: boolean;
  modalMenuItems?: IModalMenuItems[];
};

const Dropdown: React.FC<Props> = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      as,
      drop,
      toggleComponent,
      isMenuWidthFit,
      unmount,
      modalMenuItems = [] as any,
    },
    ref
  ) => {
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
      drop === "up"
        ? { bottom: height + 5 }
        : width !== 0
          ? { minWidth: width }
          : {};

    if (modalMenuItems?.length) {
      const initialDialogsState = modalMenuItems.reduce((acc, item, index) => {
        acc[index] = false;
        return acc;
      }, {});

      const [dialogs, setDialogs] = useState(initialDialogsState);

      const openDialog = (dialog) => setDialogs({ ...dialogs, [dialog]: true });
      const closeDialog = (dialog) =>
        setDialogs({ ...dialogs, [dialog]: false });

      return (
        <>
          <Menu as={as || "div"} className="relative dropdown-btn">
            <Menu.Button ref={buttonRef}>{toggleComponent}</Menu.Button>
            <Menu.Items
              ref={ref}
              className={`absolute ${isMenuWidthFit && "menuWidthFit"}`}
              style={style}
              unmount={unmount}
            >
              {modalMenuItems.map((item, index) => {
                if (!item) {
                  return null;
                }

                return (
                  <Menu.Item
                    as="span"
                    key={index}
                    onClick={() => openDialog(index)}
                  >
                    {item.trigger}
                  </Menu.Item>
                );
              })}
              {children}
            </Menu.Items>
          </Menu>

          {modalMenuItems.map((item, index) => {
            if (!item) {
              return null;
            }

            return (
              <Dialog
                key={index}
                show={dialogs[index]}
                closeModal={() => closeDialog(index)}
                title={item.title}
                {...item.additionalModalProps}
              >
                {item.content({ closeModal: () => closeDialog(index) })}
              </Dialog>
            );
          })}
        </>
      );
    }

    return (
      <Menu as={as || "div"} className="relative dropdown-btn">
        <Menu.Button ref={buttonRef}>{toggleComponent}</Menu.Button>
        <Menu.Items
          ref={ref}
          className={`absolute ${isMenuWidthFit && "menuWidthFit"}`}
          style={style}
          unmount={unmount}
        >
          {children}
        </Menu.Items>
      </Menu>
    );
  }
);

export default Dropdown;
