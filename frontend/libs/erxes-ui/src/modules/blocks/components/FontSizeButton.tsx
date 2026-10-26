import { useComponentsContext } from '@blocknote/react';
import { IconTextSize } from '@tabler/icons-react';
import { useFontSize } from 'erxes-ui/modules/blocks/hooks/toolbar/useFontSize';

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

export const FontSizeButton = () => {
  const Components = useComponentsContext();
  const { currentSize, isFileBlock, handleSizeChange } = useFontSize();

  if (!Components || isFileBlock) {
    return null;
  }

  return (
    <Components.Generic.Menu.Root>
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button
          data-test="fontSize"
          className="bn-button"
          label="Font Size"
          mainTooltip="Font Size"
          icon={<IconTextSize size={16} />}
        />
      </Components.Generic.Menu.Trigger>
      <Components.Generic.Menu.Dropdown className="bn-menu-dropdown bn-drag-handle-menu">
        <Components.Generic.Menu.Item
          checked={!currentSize}
          onClick={() => handleSizeChange('')}
        >
          Default
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
