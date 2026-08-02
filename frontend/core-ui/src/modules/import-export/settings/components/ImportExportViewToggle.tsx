import { ImportExportSettingsPath } from '@/import-export/settings/constants/importExportSettingsPaths';
import { ToggleGroup } from 'erxes-ui';
import { useLocation, useNavigate } from 'react-router';

const VIEWS = [
  { value: ImportExportSettingsPath.Import, label: 'Import' },
  { value: ImportExportSettingsPath.Export, label: 'Export' },
];

/**
 * These two views are separate routes rather than a query param, so the toggle
 * navigates instead of setting state.
 */
export const ImportExportViewToggle = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const value = pathname.includes('/export')
    ? ImportExportSettingsPath.Export
    : ImportExportSettingsPath.Import;

  return (
    <ToggleGroup
      type="single"
      value={value}
      // Radix reports an empty value when the pressed item is toggled off, and
      // one of the two views always has to be showing.
      onValueChange={(next) => next && navigate(next)}
      variant="outline"
      className="h-8"
    >
      {VIEWS.map(({ value: path, label }) => (
        <ToggleGroup.Item key={path} value={path}>
          {label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};
