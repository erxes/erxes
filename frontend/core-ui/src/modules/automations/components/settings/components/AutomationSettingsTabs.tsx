import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import { ToggleGroup } from 'erxes-ui';
import { useLocation, useNavigate } from 'react-router';

const AUTOMATION_SETTINGS_NAV_ITEMS = [
  { label: 'Agents', path: AutomationSettingsPath.Agents },
  { label: 'Email Templates', path: AutomationSettingsPath.EmailTemplates },
  { label: 'Bots', path: AutomationSettingsPath.Bots },
];

export const AutomationSettingsTabs = () => {
  const activePath = useLocation().pathname;
  const navigate = useNavigate();

  const activeItem =
    AUTOMATION_SETTINGS_NAV_ITEMS.find(({ path }) => activePath.includes(path))
      ?.path ?? AutomationSettingsPath.Agents;

  return (
    <ToggleGroup
      type="single"
      value={activeItem}
      onValueChange={(next) => next && navigate(next)}
      variant="outline"
      className="h-8"
    >
      {AUTOMATION_SETTINGS_NAV_ITEMS.map(({ label, path }) => (
        <ToggleGroup.Item key={path} value={path}>
          {label}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
};
