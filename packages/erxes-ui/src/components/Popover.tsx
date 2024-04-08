import { Popover as PopoverContainer } from "@headlessui/react";
import { PopoverPanel } from "@erxes/ui/src/styles/main";
import React, { useState } from "react";
import { __ } from "@erxes/ui/src/utils/core";
import { usePopper } from "react-popper";

type Props = {
  trigger: any;
  children: any;
  style?: any;
  className?: string;
  closeAfterSelect?: boolean;
  ref?: any;
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
  const { trigger, children, closeAfterSelect, className, style, ref } = props;
  let [referenceElement, setReferenceElement] =
    useState<HTMLButtonElement | null>(null);
  let [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: props.placement || "auto",
  });

  return (
    <PopoverContainer style={{ position: "relative" }} ref={ref && ref}>
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
