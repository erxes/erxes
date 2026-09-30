import {
  getReportSection,
  getReportSections,
  REPORT_SECTION_PATHS,
} from '@/report/constants/reportSections';
import { cn, NavigationMenuGroup, Sidebar, useIsMobile } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

export const ReportSectionNavigation = () => {
  const { t } = useTranslation('frontline');
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const activeSection = getReportSection(pathname);

  if (isMobile) {
    return null;
  }

  return (
    <NavigationMenuGroup name={t('reports', 'Reports')}>
      {getReportSections(t).map(({ section, label, icon: Icon }) => {
        const isActive = section === activeSection;

        return (
          <Sidebar.MenuItem key={section}>
            <Sidebar.MenuButton asChild isActive={isActive}>
              <Link to={REPORT_SECTION_PATHS[section]}>
                <Icon
                  className={cn(
                    'text-accent-foreground',
                    isActive && 'text-primary',
                  )}
                />
                <span className="min-w-0 flex-1 truncate">{label}</span>
              </Link>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        );
      })}
    </NavigationMenuGroup>
  );
};
