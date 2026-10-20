import { useAutomationBuilderSecondaryPanels } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondaryPanels';
import { Button, Tooltip, cn } from 'erxes-ui';

/**
 * Toggles for the panels that open beside the node form. Active state keys
 * off aria-pressed: the tooltip trigger overwrites the button's data-state.
 */
export const AutomationBuilderPanelToggles = ({
  orientation,
}: {
  orientation: 'vertical' | 'horizontal';
}) => {
  const {
    availablePanels,
    activePanel,
    panelMeta,
    isPanelCustomized,
    togglePanel,
  } = useAutomationBuilderSecondaryPanels();

  return (
    <div
      className={cn(
        'flex gap-1',
        orientation === 'vertical' ? 'flex-col' : 'flex-row',
      )}
    >
      {availablePanels.map((panel) => {
        const { title, icon: PanelIcon } = panelMeta[panel];

        return (
          <Tooltip key={panel}>
            <Tooltip.Trigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={title}
                aria-pressed={activePanel === panel}
                onClick={() => togglePanel(panel)}
                className="relative size-8 text-muted-foreground hover:text-foreground aria-pressed:bg-primary/15 aria-pressed:text-primary aria-pressed:hover:bg-primary/20 aria-pressed:hover:text-primary"
              >
                <PanelIcon className="size-4" />
                {isPanelCustomized(panel) && (
                  <span className="absolute right-1 top-1 size-1.5 rounded-full bg-warning" />
                )}
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content
              side={orientation === 'vertical' ? 'left' : 'bottom'}
            >
              {title}
            </Tooltip.Content>
          </Tooltip>
        );
      })}
    </div>
  );
};

// Sits on the seam between the node form and the panel it opens.
export const AutomationBuilderSidebarDock = () => (
  <div className="flex h-full shrink-0 flex-col items-center border-l bg-sidebar p-1.5">
    <AutomationBuilderPanelToggles orientation="vertical" />
  </div>
);
