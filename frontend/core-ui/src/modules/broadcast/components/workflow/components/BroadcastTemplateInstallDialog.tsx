import {
  getUnansweredRequirements,
  materializeBuiltInTemplate,
  TBuiltInTemplate,
} from '@/automations/utils/builtInTemplates';
import { BroadcastTemplateRequirement } from '@/broadcast/components/workflow/components/BroadcastTemplateRequirement';
import { BroadcastTemplateSteps } from '@/broadcast/components/workflow/components/BroadcastTemplateSteps';
import { BroadcastWorkflowEditor } from '@/broadcast/components/workflow/components/BroadcastWorkflowEditor';
import { useInstallBroadcastTemplate } from '@/broadcast/components/workflow/hooks/useBroadcastTemplates';
import { IconPencil } from '@tabler/icons-react';
import { Button, Dialog, ScrollArea, Tabs } from 'erxes-ui';
import { useMemo, useState } from 'react';

const stepLabel = (template: TBuiltInTemplate, order: number) =>
  template.flow.find((step) => step.order === order)?.label || `Step ${order}`;

/**
 * A template shown as the flow it will become, beside what the organization
 * still has to have for it to work.
 *
 * The preview is the real thing: the same materializer that installs the
 * template builds what is drawn here, so nothing can be shown that would not
 * be installed.
 */
export const BroadcastTemplateInstallDialog = ({
  template,
  onOpenChange,
}: {
  template: TBuiltInTemplate | null;
  onOpenChange: (open: boolean) => void;
}) => {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const { installTemplate } = useInstallBroadcastTemplate();

  const preview = useMemo(
    () => (template ? materializeBuiltInTemplate(template, { answers }) : null),
    [template, answers],
  );

  if (!template) {
    return null;
  }

  const unanswered = getUnansweredRequirements(template, answers);

  const handleInstall = () => {
    installTemplate(template, answers);
    setAnswers({});
    onOpenChange(false);
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
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
              <Tabs.Trigger value="flow">Flow</Tabs.Trigger>
              <Tabs.Trigger value="steps">
                What each step is set to
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="flow" className="min-h-0 flex-1">
              {preview && (
                <BroadcastWorkflowEditor
                  readOnly
                  startLabel="Customer"
                  value={preview}
                />
              )}
            </Tabs.Content>

            <Tabs.Content value="steps" className="min-h-0 flex-1">
              <ScrollArea className="h-full">
                <div className="p-4">
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
                  Before you install
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {template.requirements?.length
                    ? 'These have to exist in this organization before the flow can run.'
                    : 'Nothing to set up — this flow runs on what you already have.'}
                </p>
              </div>

              {(template.requirements || []).map((requirement) => (
                <BroadcastTemplateRequirement
                  key={requirement.key}
                  requirement={requirement}
                  value={answers[requirement.key]}
                  dependsOnValue={
                    requirement.dependsOn
                      ? answers[requirement.dependsOn]
                      : undefined
                  }
                  disabled={
                    !!requirement.dependsOn &&
                    answers[requirement.dependsOn] == null
                  }
                  onChange={(value) =>
                    setAnswers((current) => ({
                      ...current,
                      [requirement.key]: value,
                    }))
                  }
                />
              ))}

              {/* Separate from the list above because these never block: what
                  is missing here is wording only the organization can write,
                  not something that has to exist first. */}
              {!!template.mustConfigure?.length && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-semibold leading-none">
                    Then write yourself
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Installing works without these, but the flow is not finished
                    until they are filled in.
                  </p>

                  {template.mustConfigure.map(({ order, label }) => (
                    <div
                      key={`${order}-${label}`}
                      className="flex items-start gap-3 rounded-lg border border-dashed p-3"
                    >
                      <IconPencil className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-tight">{label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {stepLabel(template, order)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <Dialog.Footer className="border-t px-5 py-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!!unanswered.length} onClick={handleInstall}>
            {unanswered.length
              ? `${unanswered.length} left to set up`
              : 'Install'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
