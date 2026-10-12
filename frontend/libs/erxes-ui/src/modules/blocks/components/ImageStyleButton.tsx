import {
  useBlockNoteEditor,
  useComponentsContext,
  useSelectedBlocks,
} from '@blocknote/react';
import {
  IconAlignLeft,
  IconAlignRight,
  IconArrowsMaximize,
  IconCheck,
  IconPhoto,
  TablerIconsProps,
} from '@tabler/icons-react';
import { IMAGE_STYLE_PRESETS, ImageStyle } from './CustomImageBlock';

type IconComponent = (props: TablerIconsProps) => JSX.Element;

const IMAGE_STYLE_OPTIONS: Array<{
  label: string;
  value: ImageStyle;
  Icon: IconComponent;
}> = [
  { label: 'Normal',      value: 'normal',      Icon: IconPhoto },
  { label: 'Wide',        value: 'wide',        Icon: IconArrowsMaximize },
  { label: 'Float Left',  value: 'float-left',  Icon: IconAlignLeft },
  { label: 'Float Right', value: 'float-right', Icon: IconAlignRight },
];

type ImageBlock = {
  id: string;
  type: string;
  props?: {
    imageStyle?: string;
  };
};

const ALL_STYLES: ImageStyle[] = ['normal', 'wide', 'float-left', 'float-right'];

export const ImageStyleButton = () => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();
  const selectedBlocks = useSelectedBlocks(editor);
  const selectedBlock =
    (selectedBlocks.find((block) => block.type === 'image') as
      | ImageBlock
      | undefined) ?? null;
  const rawStyle = selectedBlock?.props?.imageStyle ?? '';
  const currentStyle: ImageStyle = ALL_STYLES.includes(rawStyle as ImageStyle)
    ? (rawStyle as ImageStyle)
    : 'normal';

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
            onClick={() => handleStyleChange(value)}
          >
            <div className="flex items-center gap-2 w-full">
              {currentStyle === value ? (
                <IconCheck size={14} />
              ) : (
                <span className="w-[14px]" />
              )}
              <Icon size={14} />
              {label}
            </div>
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};
