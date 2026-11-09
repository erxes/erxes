import { TBroadcastStepsOptions } from '../../hooks/useBroadcastStepsState';
import { PageHeader, RecordSidePanel } from 'ui-modules';
import { usePagePanelContext } from '@/side-panel/hooks/usePagePanel';
import { Breadcrumb, Button, Resizable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  BroadcastStepsProvider,
  useBroadcastSteps,
} from '@/broadcast/context/BroadcastStepsContext';
import { BroadcastPreview } from '@/broadcast/components/BroadcastPreview';
import { BroadcastScheduleField } from '@/broadcast/components/steps/BroadcastScheduleField';
import { BroadcastStepActions } from '@/broadcast/components/steps/BroadcastStepActions';
import { BroadcastStepContent } from '@/broadcast/components/steps/BroadcastStepContent';
import { useFormContext } from 'react-hook-form';
import type { IBroadcastFormData } from '@/broadcast/hooks/useBroadcastForm';
import { IconBroadcast } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
export const BroadcastSteps = (options: TBroadcastStepsOptions) => (
  <BroadcastStepsProvider {...options}>
    <BroadcastStepsHeader />
    <BroadcastStepsLayout />
  </BroadcastStepsProvider>
);
const BroadcastStepsHeader = () => {
  const { t } = useTranslation('broadcasts');
  const { messageId, expand } = useBroadcastSteps();
  const pagePanel = usePagePanelContext();
  const { watch } = useFormContext<IBroadcastFormData>();
  const title = watch('title');
  if (pagePanel.page) {
    return (
      <PageHeader>
        <PageHeader.Start className="min-w-0 flex-1 pr-0">
          <Breadcrumb>
            <Breadcrumb.List className="flex-nowrap gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/broadcasts">
                    <IconBroadcast />
                    {t('broadcast')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item className="min-w-0">
                <Button
                  variant="ghost"
                  className="max-w-64"
                  onClick={pagePanel.onClose}
                >
                  <span className="truncate">{title || t('untitled')}</span>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page>{t('actions.edit')}</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
        <PageHeader.End>
          <BroadcastScheduleField />
        </PageHeader.End>
      </PageHeader>
    );
  }
  return (
    <RecordSidePanel.Header
      title={<>{t(messageId ? 'steps.edit-title' : 'steps.new-title')}</>}
      {...pagePanel.headerProps}
      onExpand={expand ?? pagePanel.headerProps.onExpand}
      actions={
        <div className="ml-auto mr-2 flex items-center gap-2">
          <BroadcastScheduleField />
        </div>
      }
    />
  );
};
const BroadcastStepsLayout = () => {
  const { method, isWorkflow } = useBroadcastSteps();

  // Keyed by method: panel sizes are read once on mount, and the sheet can
  // open in the same tick the method lands in the query string. The canvas is
  // a workflow's content, so it takes most of the split.
  return (
    <Resizable.PanelGroup
      key={method || 'default'}
      direction="horizontal"
      className="min-h-0 flex-1 bg-background"
    >
      <Resizable.Panel
        className="flex min-h-0 min-w-0 flex-col"
        defaultSize={isWorkflow ? 36 : 40}
        minSize={30}
        maxSize={55}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <BroadcastStepContent />
        </div>
        <BroadcastStepActions />
      </Resizable.Panel>

      <Resizable.Handle />
      <Resizable.Panel
        className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
        defaultSize={isWorkflow ? 64 : 60}
        minSize={45}
      >
        <BroadcastPreview />
      </Resizable.Panel>
    </Resizable.PanelGroup>
  );
};
