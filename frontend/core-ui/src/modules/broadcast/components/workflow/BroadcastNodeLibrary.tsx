import { SidebarNodeLibrarySkeleton } from '@/automations/components/builder/sidebar/components/library/SidebarNodeLibrarySkeleton';
import { useAutomationNodeLibrarySidebar } from '@/automations/components/builder/sidebar/hooks/useAutomationNodeLibrarySidebar';
import { AutomationErrorState } from '@/automations/components/common/AutomationErrorState';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { filterActionsForTargets } from '@/automations/utils/targetTypeCompat';
import { Command, Empty, IconComponent, Separator, Tooltip } from 'erxes-ui';
import { BroadcastTemplateInstallDialog } from '@/broadcast/components/workflow/BroadcastTemplateInstallDialog';
import { useBroadcastTemplates } from '@/broadcast/components/workflow/useBroadcastTemplates';
import { TBuiltInTemplate } from '@/automations/utils/builtInTemplates';
import { IconSparkles } from '@tabler/icons-react';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { IAutomationsActionConfigConstants } from 'ui-modules';

/** What a broadcast hands each run. Actions are matched against this. */
export const BROADCAST_TARGET_TYPE = 'core:contacts.customers';

/**
 * A flow whose only step is one email is the email campaign type wearing a
 * different hat. Behind another action — wait three days, then email — it
 * earns its place, so it appears once the flow has a step.
 */
const NOT_FIRST_STEP_ACTION_TYPES = ['sendEmail'];

/**
 * Always on screen beside the canvas: building a campaign is choosing steps,
 * so the list of steps is the surface, not something opened on demand. That
 * also lets it keep a fixed width no configuration form has to fit into.
 */
export const BroadcastNodeLibrary = () => {
  const { actionsConst, loading, error, refetch, onSelectNode } =
    useAutomationNodeLibrarySidebar();
  const { awaitingToConnectNodeId } = useAutomation();
  const { templates } = useBroadcastTemplates();
  const [openTemplate, setOpenTemplate] = useState<TBuiltInTemplate | null>(
    null,
  );
  const actions = useWatch<TAutomationBuilderForm>({ name: 'actions' }) as
    | TAutomationBuilderForm['actions']
    | undefined;

  const hasSteps = !!actions?.length;

  const renderBody = () => {
    if (loading) {
      return <SidebarNodeLibrarySkeleton />;
    }

    if (error) {
      return (
        <AutomationErrorState
          errorCode={error.message}
          errorDetails={error.stack}
          onRetry={refetch}
        />
      );
    }

    const available = filterActionsForTargets(actionsConst || [], [
      BROADCAST_TARGET_TYPE,
    ]).filter(
      ({ type }) => hasSteps || !NOT_FIRST_STEP_ACTION_TYPES.includes(type),
    );

    return (
      <Command className="min-h-0 flex-1 bg-transparent">
        <Command.Input placeholder="Search steps..." />
        {/* The shared list caps itself at max-h-72; here the panel owns the
            height and the list scrolls to fill it. cmdk wraps the items in its
            own sizer div, so the row gap has to be applied there. */}
        <Command.List className="max-h-none flex-1 p-3 [&>div]:flex [&>div]:flex-col [&>div]:gap-2">
          <Command.Empty>No step matches that search</Command.Empty>
          {available.map((item: IAutomationsActionConfigConstants) => (
            <BroadcastActionRow
              key={item.type}
              item={item}
              onSelect={() =>
                onSelectNode({
                  nodeType: AutomationNodeType.Action,
                  type: item.type,
                  label: item.label,
                  icon: item.icon || '',
                  description: item.description || '',
                })
              }
            />
          ))}
        </Command.List>
      </Command>
    );
  };

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l bg-sidebar">
      <div className="shrink-0 space-y-0.5 px-4 py-3">
        <h3 className="text-sm font-semibold leading-none">Add a step</h3>
        <p className="text-xs leading-4 text-muted-foreground">
          {awaitingToConnectNodeId
            ? 'Pick what runs after the selected step.'
            : 'Each step runs once for every customer this campaign reaches.'}
        </p>
      </div>
      <Separator />

      {/* Only while the flow is empty: once there are steps, the reason to
          reach for a whole template is gone and the list is in the way. */}
      {!hasSteps && !!templates.length && (
        <>
          <div className="space-y-2 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Start from a template
            </p>
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setOpenTemplate(template)}
                className="flex w-full items-center gap-3 rounded-lg border bg-background px-3 py-2.5 text-left transition-colors duration-150 hover:border-primary hover:bg-accent/40"
              >
                <Empty.Media variant="icon" className="size-8 [&>svg]:size-4">
                  <IconSparkles />
                </Empty.Media>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium leading-tight">
                    {template.name}
                  </div>
                  {template.description && (
                    <div className="truncate text-xs text-muted-foreground">
                      {template.description}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          <Separator />
        </>
      )}

      {renderBody()}

      <BroadcastTemplateInstallDialog
        template={openTemplate}
        onOpenChange={(open) => !open && setOpenTemplate(null)}
      />
    </div>
  );
};

/**
 * Broadcast's own row. Every step here is an action, so the builder's
 * green-for-action colouring would say nothing, and the flow is built by
 * clicking rather than dragging onto the canvas.
 */
const BroadcastActionRow = ({
  item,
  onSelect,
}: {
  item: IAutomationsActionConfigConstants;
  onSelect: () => void;
}) => (
  <Command.Item
    value={item.label}
    onSelect={onSelect}
    className="!h-auto w-full cursor-pointer rounded-lg border bg-background !p-0 transition-colors duration-150 hover:border-primary hover:bg-accent/40 data-[selected=true]:border-primary data-[selected=true]:bg-accent/40"
  >
    <div className="flex w-full items-center gap-3 px-3 py-2.5">
      <Empty.Media variant="icon" className="size-8 [&>svg]:size-4">
        <IconComponent name={item.icon} />
      </Empty.Media>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium leading-tight">
          {item.label}
        </div>
        {item.description ? (
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <div className="truncate text-xs text-muted-foreground">
                  {item.description}
                </div>
              </Tooltip.Trigger>
              <Tooltip.Content className="max-w-xs">
                {item.description}
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        ) : null}
      </div>
    </div>
  </Command.Item>
);
