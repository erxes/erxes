import React, { useEffect, useState } from 'react';
import Popover from 'react-bootstrap/Popover';
import { COLORS } from '@erxes/ui/src/constants/colors';
import {
  RichTextEditorControlBase,
  IRichTextEditorControlBaseProps
} from './RichTextEditorControl';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import TwitterPicker from 'react-color/lib/Twitter';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Icon from '../../Icon';
import { colors } from '../../../styles';

const LinkIcon: IRichTextEditorControlBaseProps['icon'] = () => (
  <Icon icon="stopwatch" />
);
export const RichTextEditorColorControl = () => {
  const [color, setColor] = useState(colors.colorPrimary);

  const { editor, labels } = useRichTextEditorContext();
  const currentColor = editor?.getAttributes('textStyle').color || null;

  const label = labels.colorControlLabel(color);
  const handleColorChange = (selectedColor: {
    hex: React.SetStateAction<string>;
  }) => {
    setColor(selectedColor.hex);
  };
  useEffect(() => {
    if (editor) {
      editor
        ?.chain()
        .focus()
        .setColor(color)
        .run();
    }
  }, [color]);
  return (
    <OverlayTrigger
      trigger="click"
      rootClose={true}
      placement="bottom-start"
      overlay={
        <Popover id="color-picker">
          <TwitterPicker
            triangle="hide"
            color={color}
            onChange={handleColorChange}
            colors={COLORS}
          />
        </Popover>
      }
    >
      <RichTextEditorControlBase
        icon={LinkIcon}
        aria-label={labels.linkControlLabel}
        title={labels.linkControlLabel}
        active={editor?.isActive('textStyle')}
      />
    </OverlayTrigger>
  );
};
