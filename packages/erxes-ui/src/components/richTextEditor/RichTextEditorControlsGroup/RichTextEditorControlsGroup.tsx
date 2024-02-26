import { Listbox, Transition } from '@headlessui/react';
import React, { ReactNode, useRef, useState } from 'react';

import { ControlsGroupWrapper } from './styles';
import { useRichTextEditorContext } from '../RichTextEditor.context';

export interface IRichTextEditorControlsGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * If true, creates a dropdown menu where the first child,
   * assumed to be a distinct control (React.Children), is rendered separately,
   * while the subsequent children are presented as items within the menu list.
   */
  isDropdown?: boolean;
  controlNames?: Record<string, any> | string[];
  toolbarPlacement?: 'top' | 'bottom';
  children: ReactNode;
}

export const RichTextEditorControlsGroup = (
  props: IRichTextEditorControlsGroupProps,
) => {
  const { isDropdown, controlNames, toolbarPlacement, children } = props;
  const { editor, isSourceEnabled } = useRichTextEditorContext();
  const ref = useRef<HTMLDivElement>(null);

  const isActive = isDropdown
    ? controlNames
        ?.map((name: Record<string, any> | string) => !!editor?.isActive(name))
        .some(Boolean)
    : false;

  if (isDropdown) {
    const childrenArray = React.Children.toArray(children);
    const firstChild = childrenArray?.length > 0 ? childrenArray[0] : null;

    const [selectedItem, setSelectedItem] = useState(firstChild);

    return (
      <ControlsGroupWrapper
        $isActive={isActive}
        $toolbarPlacement={toolbarPlacement}
      >
        <Listbox
          value={selectedItem}
          onChange={setSelectedItem}
          disabled={isSourceEnabled}
        >
          {({ open }) => (
            <div className="relative">
              <Listbox.Button id="rte-controls-group-dropdown-button">
                {selectedItem}
              </Listbox.Button>
              <Transition
                show={open}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="absolute mt-1 w-full rounded-md bg-white shadow-lg"
              >
                <Listbox.Options static>
                  {React.Children.map(childrenArray, (child, index) => {
                    return (
                      /** as="span" here is a just workaround. Since it doesnt work well with form submission when as button. */
                      <Listbox.Option
                        key={`${child.toString()}-${index}`}
                        value={child}
                        disabled={isSourceEnabled}
                        as="span"
                      >
                        {child}
                      </Listbox.Option>
                    );
                  })}
                </Listbox.Options>
              </Transition>
            </div>
          )}
        </Listbox>
      </ControlsGroupWrapper>
    );
  }
  return <ControlsGroupWrapper ref={ref} {...props} />;
};
