import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { z } from 'zod';
import { arrayMove } from '@dnd-kit/sortable';

type FormData = z.infer<typeof FORM_CONTENT_SCHEMA>;
type FormField = FormData['fields'][number];
type FormStep = FormData['steps'][number];

interface UseFormDragAndDropProps {
  form: UseFormReturn<FormData>;
  fields: FormField[];
  steps: FormStep[];
  fieldsByStep: Record<string, FormField[]>;
  getFirstStepId: () => string;
}

export function useFormDragAndDrop({
  form,
  fields,
  steps,
  fieldsByStep,
  getFirstStepId,
}: UseFormDragAndDropProps) {
  const { replace } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeField = fields.find((f) => f.id === String(active.id));
    if (!activeField) return;

    const firstStepId = getFirstStepId();
    const activeStepId = activeField.stepId || firstStepId;
    const activeStepFields = fieldsByStep[activeStepId] || [];
    const activeIndex = activeStepFields.findIndex((f) => f.id === active.id);

    if (activeIndex === -1) return;

    let overStepId: string | undefined;
    let overIndex: number | undefined;

    const overField = fields.find((f) => f.id === String(over.id));
    if (overField) {
      overStepId = overField.stepId || firstStepId;
      const overStepFields = fieldsByStep[overStepId] || [];
      overIndex = overStepFields.findIndex((f) => f.id === String(over.id));
    } else {
      const stepExists = steps.find((s) => s.id === String(over.id));
      if (stepExists) {
        overStepId = String(over.id);
        overIndex = fieldsByStep[overStepId]?.length || 0;
      }
    }

    if (overStepId === undefined || overIndex === undefined) return;

    if (activeStepId === overStepId) {
      const reorderedStepFields = arrayMove(
        activeStepFields,
        activeIndex,
        overIndex,
      );
      const newFields = fields.map((field) => {
        const reorderedField = reorderedStepFields.find(
          (f) => f.id === field.id,
        );
        return reorderedField || field;
      });
      replace(newFields);
    } else {
      const overStepFields = fieldsByStep[overStepId] || [];
      const updatedField = { ...activeField, stepId: overStepId };

      const newFields: FormField[] = [];
      const processedIds = new Set<string>();

      steps.forEach((step) => {
        if (step.id === activeStepId) {
          activeStepFields
            .filter((f) => f.id !== active.id)
            .forEach((field) => {
              newFields.push(field);
              processedIds.add(field.id);
            });
        } else if (step.id === overStepId) {
          overStepFields.forEach((field, index) => {
            if (index === overIndex && !processedIds.has(String(active.id))) {
              newFields.push(updatedField);
              processedIds.add(String(active.id));
            }
            if (!processedIds.has(field.id)) {
              newFields.push(field);
              processedIds.add(field.id);
            }
          });
          if (
            overIndex >= overStepFields.length &&
            !processedIds.has(String(active.id))
          ) {
            newFields.push(updatedField);
            processedIds.add(String(active.id));
          }
        } else {
          const stepFields = fieldsByStep[step.id] || [];
          stepFields.forEach((field) => {
            if (!processedIds.has(field.id)) {
              newFields.push(field);
              processedIds.add(field.id);
            }
          });
        }
      });

      replace(newFields);
    }
  };

  return {
    sensors,
    handleDragEnd,
  };
}
