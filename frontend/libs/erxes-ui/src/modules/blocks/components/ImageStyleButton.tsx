import {
  useBlockNoteEditor,
  useComponentsContext,
  useSelectedBlocks,
} from '@blocknote/react';
import {
  IconAlignLeft,
  IconAlignRight,
  IconArrowsMaximize,
  IconPhoto,
} from '@tabler/icons-react';
import { IMAGE_STYLE_PRESETS, ImageStyle } from './CustomImageBlock';
import { cn } from 'erxes-ui/lib';
import type { IBlockEditor } from '../types';

const IMAGE_STYLE_OPTIONS: Array<{
  label: string;
  value: ImageStyle;
  Icon: typeof IconPhoto;
}> = [
  { label: 'Normal', value: 'normal', Icon: IconPhoto },
  { label: 'Wide', value: 'wide', Icon: IconArrowsMaximize },
  { label: 'Float Left', value: 'float-left', Icon: IconAlignLeft },
  { label: 'Float Right', value: 'float-right', Icon: IconAlignRight },
];

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
            className={cn(
              'focus:bg-primary/15! focus:text-primary! hover:bg-primary/15! hover:text-primary!',
              currentStyle === value && 'bg-primary/10! text-primary!',
            )}
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
