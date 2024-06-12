import React, { useState } from "react";

import { Popover } from "@headlessui/react";
import { TipContent } from "@erxes/ui/src/styles/main";
import { usePopper } from "react-popper";

type Props = {
  text?: string | React.ReactNode;
  children: any;
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

const Tip = ({ text, children, placement }: Props) => {
  const [opens, setOpen] = useState(false);

  let [referenceElement, setReferenceElement] = useState(null);
  let [popperElement, setPopperElement] = useState(null);
  let { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement,
  });

  return (
    <Popover>
      {({ open, close }) => (
        <>
          <div
            className="headlessui-popover-tooltip"
            ref={setReferenceElement}
            onMouseEnter={() => {
              setOpen(true);
              open;
            }}
            onMouseLeave={() => {
              setOpen(false);
              close;
            }}
          >
            {children}
          </div>

          {opens && (
            <TipContent
              ref={setPopperElement}
              style={styles.popper}
              {...attributes.popper}
            >
              {text}
            </TipContent>
          )}
        </>
      )}
    </Popover>
  );
};

export default Tip;
