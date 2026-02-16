import {
  Button,
  Breadcrumb,
  IconComponent,
  useQueryState,
  Separator,
} from 'erxes-ui';
import { REPORT_MODULES } from '../../constants/modules';
import { Link } from 'react-router-dom';
import { FavoriteToggleIconButton } from 'ui-modules';

export const ReportsBreadcrumbs = () => {
  const [reportModule] = useQueryState<string | undefined>('reportModule');
  const currentReportModule = REPORT_MODULES.find(
    (module) => module.module === reportModule,
  );
  if (!reportModule) {
    return null;
  }
  return (
    <>
      <Separator.Inline />
      <Breadcrumb.Item>
        <Button variant="ghost" asChild>
          <Link to={`/frontline/reports?module=${reportModule}`}>
            <IconComponent name={currentReportModule?.icon} />
            {currentReportModule?.name}
          </Link>
        </Button>
        <FavoriteToggleIconButton />
      </Breadcrumb.Item>
    </>
  );
};
