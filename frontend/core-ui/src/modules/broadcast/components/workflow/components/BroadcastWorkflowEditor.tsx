import { AutomationBuilderDnDProvider } from '@/automations/context/AutomationBuilderDnDProvider';
import { AutomationProvider } from '@/automations/context/AutomationProvider';
import { BroadcastNodeConfigSheet } from '@/broadcast/components/workflow/components/BroadcastNodeConfigSheet';
import { BroadcastNodeLibrary } from '@/broadcast/components/workflow/components/BroadcastNodeLibrary';
import { BroadcastWorkflowCanvas } from '@/broadcast/components/workflow/components/BroadcastWorkflowCanvas';
import {
  TBroadcastWorkflow,
  useBroadcastWorkflowEditorBody,
  useBroadcastWorkflowEditorForm,
} from '@/broadcast/components/workflow/hooks/useBroadcastWorkflowEditor';
import { ReactFlowProvider } from '@xyflow/react';
import { FormProvider } from 'react-hook-form';

export type { TBroadcastWorkflow };

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
  const form = useBroadcastWorkflowEditorForm(value, startLabel);

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
  useBroadcastWorkflowEditorBody(readOnly, onChange);

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
