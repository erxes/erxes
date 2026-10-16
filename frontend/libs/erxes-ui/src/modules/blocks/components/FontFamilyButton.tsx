import { useComponentsContext } from '@blocknote/react';
import { useFontFamily } from 'erxes-ui/modules/blocks/hooks/toolbar/useFontFamily';
import { FONT_FAMILIES } from 'erxes-ui/modules/blocks/constant/toolbar/fontFamilies';
import { IconTypography } from '@tabler/icons-react';

export const FontFamilyButton = () => {
  const Components = useComponentsContext();
  const { currentFont, isFileBlock, handleFontChange } = useFontFamily();

  if (!Components || isFileBlock) {
    return null;
  }

  return (
    <Components.Generic.Menu.Root>
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button
          data-test="fontFamily"
          className="bn-button"
          label="Font"
          mainTooltip="Font Family"
          icon={<IconTypography size={16} />}
        />
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown className="bn-menu-dropdown bn-drag-handle-menu">
        {FONT_FAMILIES.map((font) => (
          <Components.Generic.Menu.Item
            key={font.value || 'default'}
            checked={currentFont === font.value}
            onClick={() => handleFontChange(font.value)}
          >
            <div
              className="flex items-center gap-2 w-full"
              style={{ fontFamily: font.value }}
            >
              {font.name}
            </div>
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};
