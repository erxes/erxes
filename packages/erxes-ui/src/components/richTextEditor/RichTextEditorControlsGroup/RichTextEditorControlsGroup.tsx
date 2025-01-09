import { Listbox, Transition } from '@headlessui/react';
import React, { ReactNode, useRef, useState } from 'react';

import { ControlsGroupWrapper } from './styles';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import { useDropdownPlacement } from '../hooks/index';
import Icon from '../../Icon';
import styled from 'styled-components';
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

const StyledListOptions = styled(Listbox.Options)`
  width: 100%;
  border-radius: 0.25rem;
  border: 0.0625rem solid #eee;
`;

const MoreIcon = (props) => <Icon icon="angle-down" {...props} />;

export const RichTextEditorControlsGroup = (
  props: IRichTextEditorControlsGroupProps
) => {
  const { isDropdown, controlNames, children } = props;
  const { editor, isSourceEnabled } = useRichTextEditorContext();

  // This hook manages menu placement by determining whether the dropdown should appear at the top or bottom of the screen based on its position.
  const {
    setReferenceElement,
    setPopperElement,
    popper: { styles, attributes },
  } = useDropdownPlacement();

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
      <ControlsGroupWrapper $isActive={isActive}>
        <Listbox
          value={selectedItem}
          onChange={setSelectedItem}
          disabled={isSourceEnabled}
        >
          {({ open }) => (
            <div className="relative">
              <Listbox.Button
                as="div"
                data-group-dropdown={true}
                style={{
                  position: 'relative',
                  textAlign: 'left',
                  paddingLeft: '6px',
                  width: '45px',
                  border: '0',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                }}
                id="rte-controls-group-dropdown-button"
                ref={setReferenceElement}
              >
                <span style={{ display: 'block' }}>{selectedItem}</span>
                <span
                  style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    left: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: 2,
                  }}
                >
                  <MoreIcon color={isSourceEnabled ? '#AAAEB3' : '#444'} />
                </span>
              </Listbox.Button>
              <Transition
                show={open}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
                className="absolute mt-1 w-full rounded-md bg-white shadow-lg"
              >
                <StyledListOptions
                  static
                  ref={setPopperElement}
                  style={{
                    width: '100%',
                    ...styles.popper,
                  }}
                  {...attributes.popper}
                >
                  {React.Children.map(childrenArray, (child, index) => {
                    return (
                      /** as="span" here is a just workaround. Since it doesnt work well with form submission when as button. */
                      <Listbox.Option
                        key={`${index}`}
                        value={child}
                        disabled={isSourceEnabled}
                        as="span"
                      >
                        {child}
                      </Listbox.Option>
                    );
                  })}
                </StyledListOptions>
              </Transition>
            </div>
          )}
        </Listbox>
      </ControlsGroupWrapper>
    );
  }
  return <ControlsGroupWrapper ref={ref} {...props} />;
};
