import {
  useBlockNoteEditor,
  useComponentsContext,
  useSelectedBlocks,
} from '@blocknote/react';
import { IconCheck, IconPhoto } from '@tabler/icons-react';
import { IMAGE_STYLE_PRESETS, ImageStyle } from './CustomImageBlock';

const IMAGE_STYLE_OPTIONS: Array<{
  label: string;
  value: ImageStyle;
}> = [
  { label: 'Normal', value: 'normal' },
  { label: 'Wide', value: 'wide' },
];

type ImageBlock = {
  id: string;
  type: string;
  props?: {
    imageStyle?: string;
  };
};

export const ImageStyleButton = () => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();
  const selectedBlocks = useSelectedBlocks(editor);
  const selectedBlock =
    (selectedBlocks.find((block) => block.type === 'image') as
      | ImageBlock
      | undefined) ?? null;
  const currentStyle: ImageStyle =
    selectedBlock?.props?.imageStyle === 'wide' ? 'wide' : 'normal';

  if (!Components || !editor || !selectedBlock) {
    return null;
  }

  const handleStyleChange = (imageStyle: ImageStyle) => {
    editor.updateBlock(selectedBlock, {
      props: {
        imageStyle,
        previewWidth: IMAGE_STYLE_PRESETS[imageStyle].previewWidth,
      },
    });
    editor.focus();
  };

  const currentLabel =
    IMAGE_STYLE_OPTIONS.find((option) => option.value === currentStyle)
      ?.label || 'Image';

  return (
    <Components.Generic.Menu.Root>
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button
          className="bn-button"
          label={currentLabel}
          mainTooltip="Image Style"
          icon={<IconPhoto size={16} />}
        />
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown className="bn-menu-dropdown bn-drag-handle-menu">
        {IMAGE_STYLE_OPTIONS.map((option) => (
          <Components.Generic.Menu.Item
            key={option.value}
            onClick={() => handleStyleChange(option.value)}
          >
            <div className="flex items-center gap-2 w-full">
              {currentStyle === option.value && <IconCheck size={14} />}
              {currentStyle !== option.value && <span className="w-[14px]" />}
              {option.label}
            </div>
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};
