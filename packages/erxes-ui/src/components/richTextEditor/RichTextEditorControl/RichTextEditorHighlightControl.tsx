import { ColorPickerWrapper, MenuItem, PickerAction } from './styles';
import {
  IRichTextEditorControlBaseProps,
  RichTextEditorControlBase,
} from './RichTextEditorControl';
import React, { useEffect, useState } from 'react';

import ChromePicker from 'react-color/lib/Chrome';
import CompactPicker from 'react-color/lib/Compact';
import { Flex } from '../../../styles/main';
import Icon from '../../Icon';
import { Popover } from '@headlessui/react';
import Tip from '../../Tip';
import { colors } from '../../../styles';
import { getAttributesForEachSelected } from '../utils/getAttributesForEachSelected';
import { useRichTextEditorContext } from '../RichTextEditor.context';

export const RichTextEditorHighlightControl = () => {
  let overLayRef;
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [pickerColor, setPickerColor] = useState(colors.colorPrimary);
  const [color, setColor] = useState('');

  const { editor, labels, isSourceEnabled } = useRichTextEditorContext();

  useEffect(() => {
    if (!color) {
      editor?.chain().focus().unsetHighlight().run();
    } else {
      editor?.chain().focus().setHighlight({ color }).run();
    }
  }, [color]);

  useEffect(() => {
    const allSelectionTextStyleAttrs = editor
      ? getAttributesForEachSelected(editor?.state, 'highlight')
      : [];

    const currentSelectionTextColors: string[] = allSelectionTextStyleAttrs.map(
      (attrs) => attrs.color
    );

    const numUniqueSelectionTextColors = new Set(currentSelectionTextColors)
      .size;

    if (numUniqueSelectionTextColors === 1) {
      setColor(currentSelectionTextColors[0]);
      setPickerColor(currentSelectionTextColors[0]);
    }
  }, [editor?.state]);

  const handleColorChange = (selectedColor: {
    hex: React.SetStateAction<string>;
  }) => {
    setColor(selectedColor?.hex);
    overLayRef.hide();
  };

  const handleClear = () => {
    editor?.chain().focus().unsetHighlight().run();
    overLayRef.hide();
  };

  const handlePicker = (selectedColor: {
    hex: React.SetStateAction<string>;
  }) => {
    setPickerColor(selectedColor?.hex);
  };

  const handleColorSelection = () => {
    setColor(pickerColor);
    overLayRef.hide();
    setIsPickerVisible(false);
  };

  const handleOverlayClose = () => {
    overLayRef.hide();
    setIsPickerVisible(false);
  };

  const allCurrentTextStyleAttrs = editor
    ? getAttributesForEachSelected(editor?.state, 'highlight')
    : [];

  const currentHighlights: string[] = allCurrentTextStyleAttrs.map(
    (attrs) => attrs.color
  );

  const numUniqueCurrentHighlights = new Set(currentHighlights).size;

  let isActive: boolean;
  if (numUniqueCurrentHighlights > 0) {
    isActive = true;
  } else {
    isActive = false;
  }

  const LinkIcon: IRichTextEditorControlBaseProps['icon'] = () => (
    <span
      className="editor_icon bgcolor_icon"
      style={{ ...(isSourceEnabled && { opacity: 0.3 }) }}
    />
  );

  const renderColorPickerOverlay = () => (
    <ColorPickerWrapper>
      {isPickerVisible ? (
        <>
          <ChromePicker
            disableAlpha={true}
            color={pickerColor}
            onChange={handlePicker}
          />
          <Flex>
            <Tip placement="top" text="Save">
              <PickerAction onClick={handleColorSelection}>
                <Icon icon="check" size={15} color="green" />
              </PickerAction>
            </Tip>
            <Tip placement="top" text="Cancel">
              <PickerAction onClick={handleOverlayClose}>
                <Icon icon="cancel" size={15} color="red" />
              </PickerAction>
            </Tip>
          </Flex>
        </>
      ) : (
        <>
          <MenuItem onClick={handleClear}>
            <Icon icon="eraser-1" />
            Remove color
          </MenuItem>
          <CompactPicker
            style={{ border: 'none' }}
            triangle="hide"
            color={color}
            onChange={handleColorChange}
          />
          <MenuItem onClick={() => setIsPickerVisible(true)}>
            <Icon icon="paintpalette" />
            Color picker
          </MenuItem>
        </>
      )}
    </ColorPickerWrapper>
  );

  return (
    <Popover id="background-color-picker">
      <Popover.Button as="span" disabled={isSourceEnabled}>
        <RichTextEditorControlBase
          icon={LinkIcon}
          aria-label={labels.highlightControlLabel}
          title={labels.highlightControlLabel}
          active={isActive}
        />
      </Popover.Button>
      <Popover.Panel>{renderColorPickerOverlay()}</Popover.Panel>
    </Popover>
  );
};
