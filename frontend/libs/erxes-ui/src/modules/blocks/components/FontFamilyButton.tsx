import {
  useBlockNoteEditor,
  useComponentsContext,
  useEditorContentOrSelectionChange,
} from '@blocknote/react';
import { useState } from 'react';
import { IconTypography, IconCheck } from '@tabler/icons-react';

const FONT_FAMILIES = [
  { name: 'Default', value: '' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Garamond', value: 'Garamond, serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { name: 'Palatino', value: 'Palatino, serif' },
  { name: 'Tahoma', value: 'Tahoma, sans-serif' },
  { name: 'Century Gothic', value: '"Century Gothic", sans-serif' },
  { name: 'Lucida Sans', value: '"Lucida Sans", sans-serif' },
  { name: 'Monaco', value: 'Monaco, monospace' },
  { name: 'Consolas', value: 'Consolas, monospace' },
  { name: 'Calibri', value: 'Calibri, sans-serif' },
  { name: 'Cambria', value: 'Cambria, serif' },
  { name: 'Didot', value: 'Didot, serif' },
  { name: 'Rockwell', value: 'Rockwell, serif' },
  { name: 'Franklin Gothic', value: '"Franklin Gothic Medium", sans-serif' },
  { name: 'Impact', value: 'Impact, fantasy' },
];

export const FontFamilyButton = () => {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext();
  const [currentFont, setCurrentFont] = useState('');

  useEditorContentOrSelectionChange(() => {
    if (!editor) return;
    try {
      const styles = editor.getActiveStyles() as any;
      setCurrentFont(styles?.fontFamily || '');
    } catch {
      // ignore
    }
  }, editor);

  const handleFontChange = (fontValue: string) => {
    if (!editor) return;

    try {
      if (fontValue === '') {
        (editor as any).removeStyles({ fontFamily: '' });
      } else {
        (editor as any).addStyles({ fontFamily: fontValue });
      }
      editor.focus();
    } catch (error) {
      console.error('Error changing font:', error);
    }
  };

  if (!Components) {
    return null;
  }

  const currentFontName =
    FONT_FAMILIES.find((f) => f.value === currentFont)?.name || 'Default';

  return (
    <Components.Generic.Menu.Root>
      <Components.Generic.Menu.Trigger>
        <Components.FormattingToolbar.Button
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
            onClick={() => handleFontChange(font.value)}
          >
            <div
              className="flex items-center gap-2 w-full"
              style={{ fontFamily: font.value }}
            >
              {currentFont === font.value && <IconCheck size={14} />}
              {currentFont !== font.value && <span className="w-[14px]" />}
              {font.name}
            </div>
          </Components.Generic.Menu.Item>
        ))}
      </Components.Generic.Menu.Dropdown>
    </Components.Generic.Menu.Root>
  );
};
