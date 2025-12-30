import { formSetupContentAtom } from '../states/formSetupStates';
import { FormMutateLayout } from './FormMutateLayout';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InfoCard } from 'erxes-ui';
import { FormValueEffectComponent } from './FormValueEffectComponent';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { StepContainer } from './StepContainer';
import { FormFieldActions } from './FormFieldActions';
import { useFormFieldsByStep } from '../hooks/useFormFieldsByStep';
import { useFormDragAndDrop } from '../hooks/useFormDragAndDrop';
import { ErxesFormField } from './FormField';

export const FormContent = () => {
  const form = useForm<z.infer<typeof FORM_CONTENT_SCHEMA>>({
    resolver: zodResolver(FORM_CONTENT_SCHEMA),
    defaultValues: {
      title: '',
      description: '',
      buttonText: '',
      steps: [
        {
          id: 'step-1',
          label: 'Step 1',
        },
      ],
      fields: [],
    },
  });

  const onSubmit = (values: z.infer<typeof FORM_CONTENT_SCHEMA>) => {
    console.log(values);
  };

  const {
    fields: formFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  const {
    fields: steps,
    append: appendStep,
    remove: removeStep,
  } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  const { fieldsByStep, getStepFields, getStepFieldIds, getFirstStepId } =
    useFormFieldsByStep(formFields, steps);

  const {
    sensors,
    activeId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    collisionDetectionStrategy,
  } = useFormDragAndDrop({
    form,
    fields: formFields,
    steps,
    fieldsByStep,
    getFirstStepId,
  });

  const activeField = activeId
    ? formFields.find((f) => f.id === String(activeId))
    : null;

  return (
    <FormMutateLayout
      title="Content"
      description="Content"
      form={form}
      onSubmit={onSubmit}
    >
      <FormValueEffectComponent form={form} atom={formSetupContentAtom} />
      <InfoCard title="Fields">
        <InfoCard.Content>
          <DndContext
            sensors={sensors}
            collisionDetection={collisionDetectionStrategy}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <div className="flex flex-col gap-6">
              {steps.map((step) => {
                const stepFields = getStepFields(step.id);
                const stepFieldIds = getStepFieldIds(step.id);

                return (
                  <StepContainer
                    key={step.id}
                    step={step}
                    stepFields={stepFields}
                    stepFieldIds={stepFieldIds}
                    steps={steps}
                    formFields={formFields}
                    form={form}
                    removeStep={removeStep}
                    removeField={remove}
                    getFirstStepId={getFirstStepId}
                  />
                );
              })}
            </div>
            <FormFieldActions
              steps={steps}
              appendStep={appendStep}
              appendField={append}
              getFirstStepId={getFirstStepId}
            />
            {createPortal(
              <DragOverlay>
                {activeField ? (
                  <div className="w-64">
                    <ErxesFormField
                      field={activeField}
                      remove={() => {
                        // No-op for drag overlay
                      }}
                      isDragOverlay
                    />
                  </div>
                ) : null}
              </DragOverlay>,
              document.body,
            )}
          </DndContext>
        </InfoCard.Content>
      </InfoCard>
    </FormMutateLayout>
  );
};
