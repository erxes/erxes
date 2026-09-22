import { ImportExportSettingsPath } from '@/import-export/settings/constants/importExportSettingsPaths';
import { ToggleGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

const VIEWS = [
  { value: ImportExportSettingsPath.Import, labelKey: 'import' },
  { value: ImportExportSettingsPath.Export, labelKey: 'export' },
];

export const ImportExportViewToggle = () => {
  const { t } = useTranslation('importExport');
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const value = pathname.includes('/export')
    ? ImportExportSettingsPath.Export
    : ImportExportSettingsPath.Import;

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => next && navigate(next)}
      variant="outline"
      className="h-8"
    >
      {VIEWS.map(({ value: path, labelKey }) => (
        <ToggleGroup.Item key={path} value={path}>
          {t(labelKey)}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};
