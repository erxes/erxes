import { Button, Input } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';
import { ErxesFormField } from './FormField';

interface StepContainerProps {
  step: z.infer<typeof FORM_CONTENT_SCHEMA>['steps'][number];
  stepFields: z.infer<typeof FORM_CONTENT_SCHEMA>['fields'];
  stepFieldIds: string[];
  steps: z.infer<typeof FORM_CONTENT_SCHEMA>['steps'];
  formFields: z.infer<typeof FORM_CONTENT_SCHEMA>['fields'];
  form: UseFormReturn<z.infer<typeof FORM_CONTENT_SCHEMA>>;
  removeStep: (index: number) => void;
  removeField: (index: number) => void;
  getFirstStepId: () => string;
}

export function StepContainer({
  step,
  stepFields,
  stepFieldIds,
  steps,
  formFields,
  form,
  removeStep,
  removeField,
  getFirstStepId,
}: StepContainerProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: step.id,
    data: {
      type: 'step',
      stepId: step.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      data-step-id={step.id}
      className={`flex flex-col gap-2 p-4 border rounded-lg transition-colors ${
        isOver ? 'bg-accent border-primary' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Input
            value={step.label}
            onChange={(e) => {
              const stepIndex = steps.findIndex((s) => s.id === step.id);
              if (stepIndex !== -1) {
                form.setValue(`steps.${stepIndex}.label`, e.target.value);
              }
            }}
            className="font-semibold border-none shadow-none p-0 h-auto"
          />
        </div>
        {steps.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const stepIndex = steps.findIndex((s) => s.id === step.id);
              if (stepIndex !== -1) {
                const fieldsToMove = formFields.filter(
                  (f) => f.stepId === step.id,
                );
                if (fieldsToMove.length > 0) {
                  const firstStepId = getFirstStepId();
                  fieldsToMove.forEach((field) => {
                    const fieldIndex = formFields.findIndex(
                      (f) => f.id === field.id,
                    );
                    if (fieldIndex !== -1) {
                      form.setValue(`fields.${fieldIndex}.stepId`, firstStepId);
                    }
                  });
                }
                removeStep(stepIndex);
              }
            }}
          >
            <IconTrash className="w-4 h-4" />
          </Button>
        )}
      </div>
      <SortableContext
        items={stepFieldIds}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-2 gap-4">
          {stepFields.map((field) => {
            const globalIndex = formFields.findIndex((f) => f.id === field.id);
            return (
              <ErxesFormField
                key={field.id}
                field={field}
                remove={() => {
                  if (globalIndex !== -1) {
                    removeField(globalIndex);
                  }
                }}
              />
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
}

