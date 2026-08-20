import { AutomationBuilderHeaderActions } from '@/automations/components/builder/header/AutomationBuilderHeaderActions';
import { AutomationBuilderNameInput } from '@/automations/components/builder/header/AutomationBuilderNameInput';
import { AutomationBuilderStatusSwitch } from '@/automations/components/builder/header/AutomationBuilderStatusSwitch';
import { AutomationDuplicatedFromLink } from '@/automations/components/builder/header/AutomationDuplicatedFromLink';
import { AutomationHeaderTabs } from '@/automations/components/builder/header/AutomationHeaderTabs';
import { useAutomationHeader } from '@/automations/components/builder/hooks/useAutomationHeader';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationNodeType } from '@/automations/types';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import {
  IconAffiliate,
  IconAlertTriangle,
  IconDeviceFloppy,
  IconEye,
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
    gotoAutomationSettings,
  } = useAutomationHeader();
  const { isEmpty } = useAutomationNodes();
  const { isReadOnly } = useAutomation();
  const { t } = useTranslation('automations');

  const isEmptyFlow =
    isEmpty(AutomationNodeType.Trigger) && isEmpty(AutomationNodeType.Action);
  const canSave = isDirty && !isEmptyFlow;

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
          <AutomationDuplicatedFromLink />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link
              to={AutomationSettingsPath.Index}
              onClick={gotoAutomationSettings}
            >
              <IconSettings />
              {t('go-to-settings')}
            </Link>
          </Button>
          <Can
            actions={['automationsCreate', 'automationsUpdate']}
            fallback={<AutomationButtonPermissionFallback />}
          >
            <Button
              disabled={loading || !canSave}
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
          <AutomationBuilderStatusSwitch
            disabled={loading}
            onSave={handleSave}
            onError={handleError}
          />
          <AutomationBuilderNameInput />
          {isReadOnly && (
            <Badge variant="secondary" className="shrink-0">
              <IconEye className="size-3.5" /> Read only
            </Badge>
          )}
          {isDirty && !isReadOnly && (
            <Badge variant="warning" className="shrink-0">
              <IconAlertTriangle className="size-3.5" /> Unsaved
            </Badge>
          )}
          <AutomationHeaderTabs toggleTabs={toggleTabs} />
        </div>
        <div className="ml-auto flex shrink-0">
          <AutomationBuilderHeaderActions />
        </div>
      </PageSubHeader>
    </div>
  );
};
