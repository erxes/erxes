import {
  useBlockNoteEditor,
  useComponentsContext,
  useSelectedBlocks,
} from '@blocknote/react';
import { IconPhoto } from '@tabler/icons-react';
import { IMAGE_STYLE_PRESETS } from 'erxes-ui/modules/blocks/components/CustomImageBlock';
import type { ImageStyle } from 'erxes-ui/modules/blocks/components/CustomImageBlock';
import { IMAGE_STYLE_OPTIONS } from 'erxes-ui/modules/blocks/constant/toolbar/imageStyleOptions';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types/index';

export const ImageStyleButton = () => {
  const editor = useBlockNoteEditor<
    IBlockEditor['schema']['blockSchema'],
    IBlockEditor['schema']['inlineContentSchema'],
    IBlockEditor['schema']['styleSchema']
  >();
  const Components = useComponentsContext();
  const selectedBlocks = useSelectedBlocks(editor);
  const selectedBlock = selectedBlocks.find((block) => block.type === 'image');
  const currentStyle =
    IMAGE_STYLE_OPTIONS.find(
      (option) => option.value === selectedBlock?.props.imageStyle,
    )?.value ?? 'normal';

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
        {IMAGE_STYLE_OPTIONS.map(({ value, label, Icon }) => (
          <Components.Generic.Menu.Item
            key={value}
            checked={currentStyle === value}
            onClick={() => handleStyleChange(value)}
          >
            <div className="flex items-center gap-2 w-full">
              <Icon size={14} />
              {label}
            </div>
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};
