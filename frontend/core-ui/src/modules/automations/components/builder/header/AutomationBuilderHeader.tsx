import { AutomationBuilderHeaderActions } from '@/automations/components/builder/header/AutomationBuilderHeaderActions';
import { AutomationBuilderNameInput } from '@/automations/components/builder/header/AutomationBuilderNameInput';
import { AutomationHeaderTabs } from '@/automations/components/builder/header/AutomationHeaderTabs';
import { useAutomationHeader } from '@/automations/components/builder/hooks/useAutomationHeader';
import {
  IconAffiliate,
  IconAlertTriangle,
  IconDeviceFloppy,
  IconSettings,
} from '@tabler/icons-react';
import { Badge, Breadcrumb, Button, PageSubHeader, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Can, PageHeader } from 'ui-modules';
import { AutomationButtonPermissionFallback } from '../../common/AutomationButtonPermissionFallback';

export const AutomationBuilderHeader = () => {
  const {
    isDirty,
    loading,
    handleSubmit,
    handleSave,
    handleError,
    toggleTabs,
  } = useAutomationHeader();
  const { t } = useTranslation('automations');

  return (
    <div>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/automations">
                    <IconAffiliate />
                    {t('automations')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/automations">
              <IconSettings />
              {t('go-to-settings')}
            </Link>
          </Button>
          <Can
            actions={['automationsCreate', 'automationsUpdate']}
            fallback={<AutomationButtonPermissionFallback />}
          >
            <Button
              disabled={loading}
              onClick={handleSubmit(handleSave, handleError)}
            >
              <IconDeviceFloppy />
              {loading ? <Spinner /> : t('save')}
            </Button>
          </Can>
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader className="flex items-center gap-4 overflow-x-auto styled-scroll">
        <div className="flex shrink-0 items-center gap-3">
          <AutomationBuilderNameInput />
          {isDirty && (
            <Badge variant="warning" className="shrink-0">
              <IconAlertTriangle className="size-3.5" /> Unsaved
            </Badge>
          )}
          <AutomationHeaderTabs toggleTabs={toggleTabs} />
        </div>
        <div className="ml-auto flex shrink-0">
          <AutomationBuilderHeaderActions
            loading={loading}
            onSave={handleSave}
            onError={handleError}
          />
        </div>
      </PageSubHeader>
    </div>
  );
};
