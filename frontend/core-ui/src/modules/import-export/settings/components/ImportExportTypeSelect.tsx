import { useImportExportTypes } from '@/import-export/hooks/useImportExportTypes';
import { formatImportExportEntityTypeLabel } from '@/import-export/shared/formatEntityTypeLabel';
import { IconCheck, IconChevronDown } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  Popover,
  Skeleton,
  useQueryState,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

const ALL_TYPES = 'all';

export const ImportExportTypeSelect = () => {
  const { t } = useTranslation('importExport');
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useQueryState<string>('type', {
    defaultValue: ALL_TYPES,
  }) as [string, (value: string | null) => void];

  const { importExportTypes, loading } = useImportExportTypes({
    operation: pathname.includes('/export') ? 'EXPORT' : 'IMPORT',
  });

  if (loading) {
    return <Skeleton className="h-8 w-32" />;
  }

  if (!importExportTypes.length) {
    return null;
  }

  const handleSelect = (contentType: string) => {
    setSelectedType(contentType === ALL_TYPES ? null : contentType);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost" role="combobox" className="font-medium">
          {formatImportExportEntityTypeLabel(
            selectedType || ALL_TYPES,
            importExportTypes,
          )}
          <IconChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </Popover.Trigger>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={t('search-record-type')} />
          <Command.List className="p-1">
            <Combobox.Empty />
            <Command.Item
              value={ALL_TYPES}
              className="cursor-pointer"
              onSelect={() => handleSelect(ALL_TYPES)}
            >
              {t('all-types')}
              {selectedType === ALL_TYPES && (
                <IconCheck className="ml-auto size-4" />
              )}
            </Command.Item>
            {importExportTypes.map(({ contentType, label }) => (
              <Command.Item
                key={contentType}
                value={label}
                className="cursor-pointer"
                onSelect={() => handleSelect(contentType)}
              >
                {label}
                {selectedType === contentType && (
                  <IconCheck className="ml-auto size-4" />
                )}
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
