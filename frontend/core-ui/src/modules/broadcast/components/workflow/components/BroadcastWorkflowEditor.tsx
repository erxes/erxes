import { AutomationBuilderDnDProvider } from '@/automations/context/AutomationBuilderDnDProvider';
import {
  AutomationProvider,
  useAutomation,
} from '@/automations/context/AutomationProvider';
import { AutomationNodeType } from '@/automations/types';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { BroadcastNodeConfigSheet } from '@/broadcast/components/workflow/components/BroadcastNodeConfigSheet';
import {
  BROADCAST_TARGET_TYPE,
  BroadcastNodeLibrary,
} from '@/broadcast/components/workflow/components/BroadcastNodeLibrary';
import { BroadcastWorkflowCanvas } from '@/broadcast/components/workflow/components/BroadcastWorkflowCanvas';
import { BROADCAST_START_NODE_ID } from '@/broadcast/components/workflow/components/BroadcastStartNode';
import { ReactFlowProvider } from '@xyflow/react';
import { TAutomationAction } from 'ui-modules';
import { useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

// The flow as the campaign carries it: the automation's own transport shape,
// which is what the server returns and what the mutation takes.
export type TBroadcastWorkflow = {
  actions?: TAutomationAction[];
  entryActionId?: string;
};

const START_HANDLE_ID = `${AutomationNodeType.Trigger}__${BROADCAST_START_NODE_ID}`;

/**
 * The campaign's flow editor.
 *
 * It keeps its own form in the builder's shape so the step library, the
 * per-step configuration forms and the variable browser all work unchanged.
 * The audience is held there as a trigger — the builder's connection,
 * condition and variable code all look up a flow's head in `triggers`, so a
 * trigger-less form could never be wired together. The campaign never sees
 * it: only the steps and the entry point leave this component.
 */
export const BroadcastWorkflowEditor = ({
  value,
  startLabel,
  readOnly,
  onChange,
}: {
  value?: TBroadcastWorkflow;
  startLabel: string;
  // A campaign that has gone live is shown, not edited: the flow it is
  // already running for people must not change under them.
  readOnly?: boolean;
  onChange?: (value: TBroadcastWorkflow) => void;
}) => {
  const form = useForm<TAutomationBuilderForm>({
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

  return (
    <AutomationProvider scoped>
      <ReactFlowProvider>
        {/* No step is dragged here — the library adds on click — but the
            builder's own edges read this context while one would be. */}
        <AutomationBuilderDnDProvider>
          <FormProvider {...form}>
            <BroadcastWorkflowEditorBody
              readOnly={readOnly}
              onChange={onChange}
            />
          </FormProvider>
        </AutomationBuilderDnDProvider>
      </ReactFlowProvider>
    </AutomationProvider>
  );
};

// Inside the providers so the canvas, the library and the configuration sheet
// all share one form scope.
const BroadcastWorkflowEditorBody = ({
  readOnly,
  onChange,
}: {
  readOnly?: boolean;
  onChange?: (value: TBroadcastWorkflow) => void;
}) => {
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
  // renders, which would otherwise write to the campaign form on every one.
  const snapshot = JSON.stringify({ actions: actions || [], entryActionId });

  useEffect(() => {
    onChange?.({ actions: actions || [], entryActionId });
  }, [snapshot]);

  // With nothing after the audience, the only place a pick can go is right
  // behind it, so it is pre-targeted: the first step chosen connects instead
  // of landing loose on the canvas.
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

  return (
    <div className="relative flex h-full min-h-0 w-full flex-row overflow-hidden">
      <BroadcastWorkflowCanvas readOnly={readOnly} />
      {!readOnly && (
        <>
          <BroadcastNodeLibrary />
          <BroadcastNodeConfigSheet />
        </>
      )}
    </div>
  );
};
