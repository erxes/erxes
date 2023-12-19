import React, { ReactNode, useRef } from 'react';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import { ControlsGroupWrapper } from './styles';

export interface IRichTextEditorControlsGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * If true, creates a dropdown menu where the first child,
   * assumed to be a distinct control (React.Children), is rendered separately,
   * while the subsequent children are presented as items within the menu list.
   */
  isDropdown?: boolean;
  children: ReactNode;
}

export const RichTextEditorControlsGroup = (
  props: IRichTextEditorControlsGroupProps
) => {
  const { isDropdown, children } = props;
  const ref = useRef<HTMLDivElement>(null);

  if (isDropdown) {
    const childrenArray = React.Children.toArray(children);
    const firstChild = childrenArray?.length > 0 ? childrenArray[0] : null;
    const dropdownMenuChildren = childrenArray.slice(1);
    return (
      <ControlsGroupWrapper>
        <Dropdown as={ButtonGroup}>
          {firstChild}
          <Dropdown.Toggle split={true} id="dropdown-split-basic" />
          <Dropdown.Menu>
            {React.Children.map(dropdownMenuChildren, (child, index) => {
              return (
                <Dropdown.Item key={index} as="button">
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
