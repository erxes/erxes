import React, { useState } from 'react';

import { Popover } from '@headlessui/react';
import { usePopper } from 'react-popper';

type Props = {
  text?: string | React.ReactNode;
  children: React.ReactNode;
  placement?:
    | 'auto-start'
    | 'auto'
    | 'auto-end'
    | 'top-start'
    | 'top'
    | 'top-end'
    | 'right-start'
    | 'right'
    | 'right-end'
    | 'bottom-end'
    | 'bottom'
    | 'bottom-start'
    | 'left-end'
    | 'left'
    | 'left-start';
};

function Tip({ text, children, placement }: Props) {
  const placementValue = placement || 'auto';

  let [referenceElement, setReferenceElement] = useState(placementValue as any);
  let [popperElement, setPopperElement] = useState(null as any);
  let { styles, attributes } = usePopper(referenceElement, popperElement);

  return (
    <Popover>
      <div ref={setReferenceElement}>{children}</div>
      <Popover.Panel
        id="tooltip"
        ref={setPopperElement}
        style={styles.popper}
        {...attributes.popper}
      >
        {text}
      </Popover.Panel>
    </Popover>
  );
}

export default Tip;
