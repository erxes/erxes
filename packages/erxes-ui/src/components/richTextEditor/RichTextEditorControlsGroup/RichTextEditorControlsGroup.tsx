import React, { ReactNode, useRef } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import { ControlsGroupWrapper } from './styles';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import DropdownButton from 'react-bootstrap/DropdownButton';
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

    return (
      <ControlsGroupWrapper
        $isActive={isActive}
        $toolbarPlacement={toolbarPlacement}
      >
        <Dropdown>
          <Dropdown.Toggle
            as="span"
            id="rte-controls-group-dropdown-button"
            disabled={isSourceEnabled}
          >
            {firstChild}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {React.Children.map(childrenArray, (child, index) => {
              return (
                /** as="span" here is a just workaround. Since it doesnt work well with form submission when as button. */
                <Dropdown.Item as="span" key={`${child.toString()}-${index}`}>
                  {child}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      </ControlsGroupWrapper>
    );
  }
  return <ControlsGroupWrapper innerRef={ref} {...props} />;
};
