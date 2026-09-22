import { IMPORT_EXPORT_STATUS_OPTIONS } from '@/import-export/settings/constants/importExportStatusOptions';
import { IconCheck } from '@tabler/icons-react';
import { Combobox, Command, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ImportExportStatusFilterView = () => {
  const { t } = useTranslation('importExport');
  const [selected, setSelected] = useQueryState<string>('status');

  return (
    <Command shouldFilter={false}>
      <Command.List className="p-1">
        <Combobox.Empty />
        {IMPORT_EXPORT_STATUS_OPTIONS.map(({ value, labelKey, icon: Icon }) => (
          <Command.Item
            key={value}
            value={value}
            className="cursor-pointer"
            onSelect={() => setSelected(value === selected ? null : value)}
          >
            <Icon className="size-4" />
            {t(labelKey)}
            {selected === value && <IconCheck className="ml-auto size-4" />}
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
