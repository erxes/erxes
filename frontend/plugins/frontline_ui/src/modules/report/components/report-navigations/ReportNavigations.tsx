import { NavigationMenuGroup } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ChooseReportModule } from '../ChooseReportModule';

export function ReportNavigations() {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.report' });
  return (
    <NavigationMenuGroup name={t('frontline-report-modules')}>
      <ChooseReportModule />
    </NavigationMenuGroup>
  );
}
