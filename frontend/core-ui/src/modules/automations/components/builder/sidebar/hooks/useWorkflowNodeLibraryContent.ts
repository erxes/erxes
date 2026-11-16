import {
  TWorkflowTemplate,
  useWorkflowTemplates,
} from '@/automations/components/builder/hooks/useWorkflowTemplates';
import { AutomationNodeType } from '@/automations/types';
import {
  DragEvent,
  MouseEvent,
  PointerEvent,
  useCallback,
  useMemo,
  useState,
} from 'react';

const DRAGGING_NODE_TYPE = 'application/reactflow/draggingNode';
const WORKFLOW_ICON = 'IconArrowsSplit';

const draggedWorkflowOf = (template: TWorkflowTemplate) =>
  JSON.stringify({
    nodeType: AutomationNodeType.Workflow,
    automationId: '',
    name: template.name,
    description: template.description || '',
    template,
  });

/**
 * Saved workflow templates as library rows: click inserts one, dragging drops
 * it on the canvas, and removing asks first. The confirm dialog lives outside
 * the rows: cmdk items select on pointer events, so a dialog nested inside a
 * row would leak its clicks into the row's select.
 */
export const useWorkflowNodeLibraryContent = () => {
  const { templates, loading, insertTemplate, removeTemplate } =
    useWorkflowTemplates();
  const [removeTarget, setRemoveTarget] = useState<TWorkflowTemplate | null>(
    null,
  );

  const rows = useMemo(
    () =>
      templates.map((template) => ({
        key: template._id,
        template,
        item: {
          type: template._id,
          label: template.name,
          description: template.description,
          icon: WORKFLOW_ICON,
        },
        onSelect: () => insertTemplate(template),
        onDragStart: (event: DragEvent) => {
          event.dataTransfer.setData(
            DRAGGING_NODE_TYPE,
            draggedWorkflowOf(template),
          );
          event.dataTransfer.effectAllowed = 'move';
        },
      })),
    [templates, insertTemplate],
  );

  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setRemoveTarget(null);
    }
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (removeTarget) {
      removeTemplate(removeTarget._id);
    }
    setRemoveTarget(null);
  }, [removeTarget, removeTemplate]);

  return {
    loading,
    rows,
    removeTarget,
    requestRemove: setRemoveTarget,
    handleDialogOpenChange,
    handleConfirmRemove,
  };
};

/**
 * The row's delete button. cmdk selects rows on pointer-up, so that must be
 * stopped too — a click handler alone fires after the row handled it.
 */
export const useWorkflowTemplateRemoveButton = ({
  template,
  onRequestRemove,
}: {
  template: TWorkflowTemplate;
  onRequestRemove: (template: TWorkflowTemplate) => void;
}) => {
  const handlePointerUp = useCallback(
    (event: PointerEvent) => event.stopPropagation(),
    [],
  );

  const handleClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation();
      onRequestRemove(template);
    },
    [onRequestRemove, template],
  );

  return { handlePointerUp, handleClick };
};
