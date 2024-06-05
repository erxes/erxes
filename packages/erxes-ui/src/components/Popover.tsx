import React, { useState } from "react";

import { Popover as PopoverContainer } from "@headlessui/react";
import { PopoverPanel } from "@erxes/ui/src/styles/main";
import { __ } from "@erxes/ui/src/utils/core";
import { usePopper } from "react-popper";

type Props = {
  trigger: any;
  children: any;
  style?: object;
  className?: string;
  closeAfterSelect?: boolean;
  innerRef?: any;
  defaultOpen?: boolean;
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

const Popover = (props: Props) => {
  const {
    trigger,
    children,
    closeAfterSelect,
    className,
    defaultOpen,
    style,
    innerRef,
  } = props;
  let [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  let [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: props.placement || "auto",
  });
  const [isOpen, setIsOpen] = useState(false);

  if (defaultOpen) {
    return (
      <PopoverContainer
        style={{ position: "relative", ...style }}
        ref={innerRef && innerRef}
      >
        {({ close }) => (
          <>
            <PopoverContainer.Button
              ref={setReferenceElement}
              onClick={() => setIsOpen(!isOpen)}
            >
              {trigger}
            </PopoverContainer.Button>
            {isOpen && (
              <PopoverPanel
                static
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
                className={className}
              >
                {closeAfterSelect ? children(close) : children}
              </PopoverPanel>
            )}
          </>
        )}
      </PopoverContainer>
    );
  }

  return (
    <PopoverContainer
      style={{ position: "relative", ...style }}
      ref={innerRef && innerRef}
    >
      {({ close }) => (
        <>
          <PopoverContainer.Button ref={setReferenceElement}>
            {trigger}
          </PopoverContainer.Button>
          <PopoverPanel
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
            className={className}
          >
            {closeAfterSelect ? children(close) : children}
          </PopoverPanel>
        </>
      )}
    </PopoverContainer>
  );
};

export default Popover;
