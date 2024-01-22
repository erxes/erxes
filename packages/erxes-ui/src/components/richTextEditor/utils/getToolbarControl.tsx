import React from 'react';
import { RichTextEditor } from '../TEditor';

type ToolbarLocationType = 'top' | 'bottom';

export type ToolbarControlParams = {
  toolbarLocation?: ToolbarLocationType;
  control: string | DropdownControlType;
};

export type DropdownControlType = {
  items: string[];
  label?: string;
  isMoreControl?: boolean;
};

type ToolbarItem = string | DropdownControlType;

export type ToolbarParamType = {
  toolbar: ToolbarItem[];
  toolbarLocation?: ToolbarLocationType;
};

const isValidToolbarParam = (param: any): param is DropdownControlType => {
  if (typeof param !== 'object' || param === null) {
    return false;
  }

  return (
    // typeof param.label === 'string' &&
    Array.isArray(param.items) &&
    param.items.every((item: any) => typeof item === 'string')
  );
};

export function getToolbarControl({
  control,
  toolbarLocation
}: ToolbarControlParams) {
  const TOOLBAR_CONTROLS = {
    bold: RichTextEditor.Bold,
    italic: RichTextEditor.Italic,
    underline: RichTextEditor.Underline,
    strikethrough: RichTextEditor.Strikethrough,
    h1: RichTextEditor.H1,
    h2: RichTextEditor.H2,
    h3: RichTextEditor.H3,
    bulletList: RichTextEditor.BulletList,
    orderedList: RichTextEditor.OrderedList,
    blockquote: RichTextEditor.Blockquote,
    link: RichTextEditor.Link,
    unlink: RichTextEditor.Unlink,
    horizontalRule: RichTextEditor.HorizontalRule,
    alignLeft: RichTextEditor.AlignLeft,
    alignRight: RichTextEditor.AlignRight,
    alignCenter: RichTextEditor.AlignCenter,
    alignJustify: RichTextEditor.AlignJustify,
    fontSize: RichTextEditor.FontSize,
    image: RichTextEditor.ImageControl,
    color: RichTextEditor.ColorControl,
    highlight: RichTextEditor.HighlightControl,
    source: RichTextEditor.SourceControl,
    placeholder: RichTextEditor.Placeholder,
    table: RichTextEditor.TableControl,
    more: RichTextEditor.MoreControl
  };

  const getControlItem = (item: ToolbarItem) => {
    if (typeof item === 'string') {
      if (item === 'fontSize')
        return React.createElement(TOOLBAR_CONTROLS[item], {
          toolbarPlacement: toolbarLocation
        });
      return React.createElement(TOOLBAR_CONTROLS[item]);
    }
  };

  const getControlNames = (items: string[]) => {
    if (items.some(item => ['h1', 'h2', 'h3'].includes(item)))
      return ['heading'];

    if (
      items.some(item =>
        ['alignLeft', 'alignRight', 'alignCenter', 'alignJustify'].includes(
          item
        )
      )
    )
      return [
        { textAlign: 'left' },
        { textAlign: 'center' },
        { textAlign: 'right' },
        { textAlign: 'justify' }
      ];

    return items;
  };

  const isValidToolbarControl = (control: string) =>
    TOOLBAR_CONTROLS.hasOwnProperty(control);

  if (!control) return null;

  if (typeof control === 'string') {
    if (!isValidToolbarControl(control)) return null;
    return getControlItem(control);
  } else {
    if (!isValidToolbarParam(control)) return null;

    const controlItems = control.items.map((item: any) => getControlItem(item));

    if (!control.isMoreControl)
      return (
        <RichTextEditor.ControlsGroup
          isDropdown={true}
          controlNames={getControlNames(control.items)}
          toolbarPlacement={toolbarLocation}
        >
          {controlItems}
        </RichTextEditor.ControlsGroup>
      );
    return (
      <RichTextEditor.MoreControl toolbarPlacement={toolbarLocation}>
        {controlItems}
      </RichTextEditor.MoreControl>
    );
  }
}
export const getToolbar = ({ toolbar, toolbarLocation }: ToolbarParamType) => {
  const controlGroups: any = [];
  let currentGroup: any = [];

  toolbar.forEach((item: string | DropdownControlType) => {
    if (item === '|') {
      // Separator encountered, push the current group to the controlGroups array
      if (currentGroup.length > 0) {
        controlGroups.push(
          <RichTextEditor.ControlsGroup key={controlGroups.length}>
            {currentGroup}
          </RichTextEditor.ControlsGroup>
        );
        currentGroup = [];
      }
    } else {
      // Control encountered, add it to the current group
      currentGroup.push(getToolbarControl({ control: item, toolbarLocation }));
    }
  });

  // Push the last group if it's not empty
  if (currentGroup.length > 0) {
    controlGroups.push(
      <RichTextEditor.ControlsGroup key={controlGroups.length}>
        {currentGroup}
      </RichTextEditor.ControlsGroup>
    );
  }
  return controlGroups;
};
