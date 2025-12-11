import { NavigationMenuGroup } from 'erxes-ui';
import { ChooseReportModule } from '../ChooseReportModule';

export function ReportNavigations() {
  return (
    <>
      <NavigationMenuGroup name="Frontline report modules">
        <ChooseReportModule />
      </NavigationMenuGroup>
    </>
  );
}
