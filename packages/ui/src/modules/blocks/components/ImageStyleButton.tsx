import {
  useBlockNoteEditor,
  useComponentsContext,
  usePortalElement,
  useSelectedBlocks,
} from '@blocknote/react';
import { IconPhoto } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import {
  IMAGE_STYLE_PRESETS,
  type ImageStyle,
} from 'erxes-ui/modules/blocks/constant/imageBlockConfig';
import { IMAGE_STYLE_OPTIONS } from 'erxes-ui/modules/blocks/constant/toolbar/imageStyleOptions';
import type { IBlockEditor } from 'erxes-ui/modules/blocks/types/TextEditor';

export const ImageStyleButton = () => {
  const editor = useBlockNoteEditor<
    IBlockEditor['schema']['blockSchema'],
    IBlockEditor['schema']['inlineContentSchema'],
    IBlockEditor['schema']['styleSchema']
  >();

  const Components = useComponentsContext();
  const portalElement = usePortalElement();
  const { t } = useTranslation('ui', { keyPrefix: 'editor' });
  const selectedBlocks = useSelectedBlocks(editor);
  const selectedBlock = selectedBlocks.find((block) => block.type === 'image');

  const currentStyle =
    IMAGE_STYLE_OPTIONS.find((option) => option.value === selectedBlock?.props.imageStyle)?.value ??
    'normal';

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

  const styleName = ({ value, label }: (typeof IMAGE_STYLE_OPTIONS)[number]) =>
    t(`image-style.${value}`, label);

  const current = IMAGE_STYLE_OPTIONS.find((option) => option.value === currentStyle);

  return (
    <Components.Generic.Menu.Root portalElement={portalElement}>
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button
          className="bn-button"
          label={current ? styleName(current) : t('image', 'Image')}
          mainTooltip={t('image-style.label', 'Image style')}
          icon={<IconPhoto size={16} />}
        />
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown className="bn-menu-dropdown bn-drag-handle-menu">
        {IMAGE_STYLE_OPTIONS.map((option) => (
          <Components.Generic.Menu.Item
            key={option.value}
            checked={currentStyle === option.value}
            onClick={() => handleStyleChange(option.value)}
          >
            <div className="flex items-center gap-2 w-full">
              <option.Icon size={14} />
              {styleName(option)}
            </div>
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};
