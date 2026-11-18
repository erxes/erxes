import { useComponentsContext, usePortalElement } from '@blocknote/react';
import { IconTextSize } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useStringStyle } from 'erxes-ui/modules/blocks/hooks/toolbar/useStringStyle';

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

export const FontSizeButton = () => {
  const Components = useComponentsContext();
  const portalElement = usePortalElement();
  const { t } = useTranslation('ui', { keyPrefix: 'editor' });

  const {
    value: currentSize,
    isFileBlock,
    setValue: handleSizeChange,
  } = useStringStyle('fontSize');

  if (!Components || isFileBlock) {
    return null;
  }

  return (
    <Components.Generic.Menu.Root portalElement={portalElement}>
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button
          data-test="fontSize"
          className="bn-button"
          label={t('font-size', 'Font size')}
          mainTooltip={t('font-size', 'Font size')}
          icon={<IconTextSize size={16} />}
        >
          {currentSize || t('default', 'Default')}
        </Components.FormattingToolbar.Button>
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown className="bn-menu-dropdown bn-drag-handle-menu">
        <Components.Generic.Menu.Item checked={!currentSize} onClick={() => handleSizeChange('')}>
          {t('default', 'Default')}
        </Components.Generic.Menu.Item>
        {FONT_SIZES.map((size) => (
          <Components.Generic.Menu.Item
            key={size}
            checked={currentSize === `${size}pt`}
            onClick={() => handleSizeChange(`${size}pt`)}
          >
            {size} pt
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};
