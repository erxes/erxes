import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { BROADCAST_TARGET_TYPE } from '@/broadcast/components/workflow/hooks/useBroadcastNodeLibrary';
import { BROADCAST_START_NODE_ID } from '@/broadcast/components/workflow/components/BroadcastStartNode';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { TAutomationAction } from 'ui-modules';

// The flow as the campaign carries it: the automation's own transport shape
export type TBroadcastWorkflow = {
  actions?: TAutomationAction[];
  entryActionId?: string;
};

const START_HANDLE_ID = `${AutomationNodeType.Trigger}__${BROADCAST_START_NODE_ID}`;

/**
 * The editor's own form in the builder's shape, with the audience held as a
 * trigger: the builder's connection, condition and variable code all look up
 * a flow's head in `triggers`.
 */
export const useBroadcastWorkflowEditorForm = (
  value: TBroadcastWorkflow | undefined,
  startLabel: string,
) =>
  useForm<TAutomationBuilderForm>({
    defaultValues: {
      name: 'Broadcast workflow',
      status: 'draft',
      edgeType: 'default',
      flowDirection: 'horizontal',
      triggers: [
        {
          id: BROADCAST_START_NODE_ID,
          type: BROADCAST_TARGET_TYPE,
          label: startLabel,
          description: '',
          config: {},
          position: { x: 0, y: 0 },
          actionId: value?.entryActionId,
        },
      ],
      actions: value?.actions || [],
      workflows: [],
    } as TAutomationBuilderForm,
  });

/**
 * Only the steps and the entry point leave the editor. With nothing after the
 * audience, the first step picked connects right behind it.
 */
export const useBroadcastWorkflowEditorBody = (
  readOnly: boolean | undefined,
  onChange: ((value: TBroadcastWorkflow) => void) | undefined,
) => {
  const { awaitingToConnectNodeId, setAwaitingToConnectNodeId } =
    useAutomation();
  const [triggers, actions] = useWatch<TAutomationBuilderForm>({
    name: ['triggers', 'actions'],
  }) as [
    TAutomationBuilderForm['triggers'] | undefined,
    TAutomationBuilderForm['actions'] | undefined,
  ];
  const entryActionId = triggers?.[0]?.actionId;

  // Reported by value: react-hook-form hands back a fresh array on unrelated
  // renders, which would otherwise write to the campaign form on every one
  const snapshot = JSON.stringify({ actions: actions || [], entryActionId });

  useEffect(() => {
    onChange?.({ actions: actions || [], entryActionId });
    // Fires on a changed snapshot only
  }, [snapshot]);

  useEffect(() => {
    if (!readOnly && !entryActionId && !awaitingToConnectNodeId) {
      setAwaitingToConnectNodeId(START_HANDLE_ID);
    }
  }, [
    readOnly,
    entryActionId,
    awaitingToConnectNodeId,
    setAwaitingToConnectNodeId,
  ]);
};
