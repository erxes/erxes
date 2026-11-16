import { TBuiltInTemplate } from '@/automations/utils/builtInTemplates';
import { BroadcastTemplateRequirement } from '@/broadcast/components/workflow/components/BroadcastTemplateRequirement';
import { BroadcastTemplateSteps } from '@/broadcast/components/workflow/components/BroadcastTemplateSteps';
import { BroadcastWorkflowEditor } from '@/broadcast/components/workflow/components/BroadcastWorkflowEditor';
import { useBroadcastTemplateInstallDialog } from '@/broadcast/components/workflow/hooks/useBroadcastTemplateInstallDialog';
import { Button, Dialog, ScrollArea, Spinner, Tabs } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * A template shown as the flow it will become, beside what the organization
 * still has to have for it to work.
 *
 * The preview is the real thing: the server query that installs the template
 * builds what is drawn here, so nothing can be shown that would not be
 * installed.
 */
export const BroadcastTemplateInstallDialog = ({
  template,
  onOpenChange,
}: {
  template: TBuiltInTemplate | null;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const {
    answers,
    preview,
    previewLoading,
    previewError,
    unansweredCount,
    installing,
    isOpen,
    defaultValueOf,
    setAnswer,
    close,
    install,
  } = useBroadcastTemplateInstallDialog({ template, onOpenChange });

  if (!template) {
    return null;
  }

  const previewState = previewLoading ? (
    <div className="flex h-full items-center justify-center">
      <Spinner />
    </div>
  ) : previewError ? (
    <p className="p-4 text-sm text-destructive">
      {t('workflow.preview-failed')}
    </p>
  ) : null;

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : close())}>
      <Dialog.Content className="flex h-[min(44rem,calc(100vh-4rem))] max-w-5xl flex-col gap-0 p-0">
        <Dialog.Header className="border-b px-5 py-4">
          <Dialog.Title>{template.name}</Dialog.Title>
          {template.description && (
            <Dialog.Description>{template.description}</Dialog.Description>
          )}
        </Dialog.Header>

        <div className="flex min-h-0 flex-1 flex-row">
          {/* The canvas says what the flow looks like; the list says what each
              step is actually set to — which a node, at this size, can only
              show the first line of. */}
          <Tabs
            defaultValue="flow"
            className="flex min-w-0 flex-1 flex-col border-r"
          >
            <Tabs.List className="mx-4 mt-3 w-fit">
              <Tabs.Trigger value="flow">{t('workflow.flow')}</Tabs.Trigger>
              <Tabs.Trigger value="steps">
                {t('workflow.step-settings')}
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="flow" className="min-h-0 flex-1">
              {previewState}
              {!previewState && preview && (
                <BroadcastWorkflowEditor
                  readOnly
                  startLabel={t('workflow.start-customer')}
                  value={preview}
                />
              )}
            </Tabs.Content>

            <Tabs.Content value="steps" className="min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {previewState}
                  <BroadcastTemplateSteps
                    template={template}
                    actions={preview?.actions || []}
                  />
                </div>
              </ScrollArea>
            </Tabs.Content>
          </Tabs>

          <ScrollArea className="w-80 shrink-0">
            <div className="space-y-3 p-4">
              <div>
                <h3 className="text-sm font-semibold leading-none">
                  {t('workflow.before-install')}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {template.requirements?.length
                    ? t('workflow.requirements')
                    : t('workflow.no-requirements')}
                </p>
              </div>

              {(template.requirements || []).map((requirement, index) => (
                <BroadcastTemplateRequirement
                  key={requirement.key}
                  requirement={requirement}
                  value={answers[requirement.key]}
                  defaultValue={defaultValueOf(requirement)}
                  dependsOnValue={
                    requirement.dependsOn
                      ? answers[requirement.dependsOn]
                      : undefined
                  }
                  disabled={!isOpen(index)}
                  onChange={(value) => setAnswer(requirement.key, value)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        <Dialog.Footer className="border-t px-5 py-3">
          <Button variant="secondary" onClick={close}>
            {t('steps.cancel')}
          </Button>
          <Button disabled={!!unansweredCount || installing} onClick={install}>
            {installing && <Spinner />}
            {installing
              ? t('workflow.installing')
              : unansweredCount
              ? t('workflow.left-to-set-up', { count: unansweredCount })
              : t('workflow.install')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
