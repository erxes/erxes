import { IconAlignLeft } from '@tabler/icons-react';
import { cn, TextField } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PANEL_TEXT_FIELD_CLASS_NAME, PanelField } from 'ui-modules';

export const RecordNameField = ({
  value,
  scope,
  placeholder,
  onSave,
}: {
  value?: string | null;
  scope: string;
  placeholder: string;
  onSave: (name: string) => void;
}) => {
  const { t } = useTranslation('operation');

  return (
    <PanelField icon={IconAlignLeft} label={t('name', 'Name')}>
      <TextField
        data-panel-inline
        scope={scope}
        value={value || ''}
        placeholder={placeholder}
        className={cn(
          PANEL_TEXT_FIELD_CLASS_NAME,
          'h-auto min-h-7 py-1 whitespace-normal [&>span]:whitespace-normal [&>span]:[overflow-wrap:anywhere]',
        )}
        onSave={(name) => {
          const trimmed = name.trim();

          if (trimmed && trimmed !== value) {
            onSave(trimmed);
          }
        }}
      />
    </PanelField>
  );
};
