import { SidebarNodeLibrarySkeleton } from '@/automations/components/builder/sidebar/components/library/SidebarNodeLibrarySkeleton';
import { AutomationErrorState } from '@/automations/components/common/AutomationErrorState';
import { TBuiltInTemplate } from '@/automations/utils/builtInTemplates';
import { BroadcastTemplateInstallDialog } from '@/broadcast/components/workflow/components/BroadcastTemplateInstallDialog';
import { useBroadcastNodeLibrary } from '@/broadcast/components/workflow/hooks/useBroadcastNodeLibrary';
import { IconSparkles } from '@tabler/icons-react';
import {
  Command,
  Empty,
  IconComponent,
  Separator,
  Tabs,
  Tooltip,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IAutomationsActionConfigConstants } from 'ui-modules';

type TLibraryState = ReturnType<typeof useBroadcastNodeLibrary>;

/**
 * Always on screen beside the canvas: building a campaign is choosing steps,
 * so the list of steps is the surface, not something opened on demand. That
 * also lets it keep a fixed width no configuration form has to fit into.
 */
export const BroadcastNodeLibrary = () => {
  const { t } = useTranslation('broadcasts');
  const library = useBroadcastNodeLibrary();
  const {
    templates,
    openTemplate,
    chooseTemplate,
    onTemplateDialogChange,
    offersTemplates,
    defaultTab,
    hintKey,
  } = library;

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l bg-sidebar">
      <div className="shrink-0 space-y-0.5 px-4 py-3">
        <h3 className="text-sm font-semibold leading-none">
          {t('workflow.add-step')}
        </h3>
        <p className="text-xs leading-4 text-muted-foreground">{t(hintKey)}</p>
      </div>
      <Separator />

      {offersTemplates ? (
        <Tabs
          defaultValue={defaultTab}
          className="flex min-h-0 flex-1 flex-col"
        >
          <Tabs.List className="mx-3 mt-3 grid shrink-0 grid-cols-2">
            <Tabs.Trigger value="templates">
              {t('workflow.templates')}
            </Tabs.Trigger>
            <Tabs.Trigger value="steps">
              {t('workflow.single-step')}
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="templates" className="min-h-0 flex-1">
            <BroadcastTemplateList
              templates={templates}
              onChoose={chooseTemplate}
            />
          </Tabs.Content>
          <Tabs.Content
            value="steps"
            className="flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
          >
            <BroadcastStepList library={library} />
          </Tabs.Content>
        </Tabs>
      ) : (
        <BroadcastStepList library={library} />
      )}

      <BroadcastTemplateInstallDialog
        template={openTemplate}
        onOpenChange={onTemplateDialogChange}
      />
    </div>
  );
};

const BroadcastTemplateList = ({
  templates,
  onChoose,
}: {
  templates: TBuiltInTemplate[];
  onChoose: (template: TBuiltInTemplate) => void;
}) => (
  <div className="flex flex-col gap-2 overflow-y-auto p-3">
    {templates.map((template) => (
      <button
        key={template.id}
        type="button"
        onClick={() => onChoose(template)}
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
);

const BroadcastStepList = ({ library }: { library: TLibraryState }) => {
  const { t } = useTranslation('broadcasts');
  const { loading, error, refetch, stepOptions } = library;

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

  return (
    <Command className="min-h-0 flex-1 bg-transparent">
      <Command.Input placeholder={t('workflow.search-steps')} />
      {/* The shared list caps itself at max-h-72; here the panel owns the
          height and the list scrolls to fill it. cmdk wraps the items in its
          own sizer div, so the row gap has to be applied there. */}
      <Command.List className="max-h-none flex-1 p-3 [&>div]:flex [&>div]:flex-col [&>div]:gap-2">
        <Command.Empty>{t('workflow.no-step')}</Command.Empty>
        {stepOptions.map(({ item, select }) => (
          <BroadcastActionRow key={item.type} item={item} onSelect={select} />
        ))}
      </Command.List>
    </Command>
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
        {item.description && (
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
        )}
      </div>
    </div>
  </Command.Item>
);
