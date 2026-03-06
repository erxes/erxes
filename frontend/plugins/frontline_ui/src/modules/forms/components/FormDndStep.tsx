import { UniqueIdentifier } from '@dnd-kit/core';
import {
  defaultAnimateLayoutChanges,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { useFormDnd } from './FormDndProvider';
import { Button, InfoCard, Input, Label, Textarea } from 'erxes-ui';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import { AddField, FormDndField } from './FormDndField';

export const FormDndStep = ({ step }: { step: UniqueIdentifier }) => {
  const { fields, steps, handleChangeStepValue, getStepValue } = useFormDnd();
  const stepFields = fields[step];
  const { attributes, listeners, setNodeRef, transition, transform } =
    useSortable({
      id: step,
      data: {
        type: 'container',
        children: stepFields,
      },
      animateLayoutChanges: defaultAnimateLayoutChanges,
    });
  const { removeStep } = useFormDnd();
  const isMultipleSteps = steps.length > 1;
  return (
    <InfoCard.Content
      style={{ transition, transform: CSS.Translate.toString(transform) }}
      ref={setNodeRef}
      className="p-0 relative gap-0"
    >
      <div className="flex items-center p-4 pb-0 gap-2">
        {isMultipleSteps && (
          <Input
            value={getStepValue(step).name}
            className="w-1/3"
            onChange={(e) =>
              handleChangeStepValue(step, 'name', e.target.value)
            }
          />
        )}
        <AddField step={step} />
        {isMultipleSteps && (
          <>
            <Button variant="ghost" size="icon" {...attributes} {...listeners}>
              <IconGripVertical />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={() => removeStep(step)}
            >
              <IconTrash />
            </Button>
          </>
        )}
      </div>
      {isMultipleSteps && (
        <div className="mx-4 mt-4 w-auto space-y-2">
          <Label>Description</Label>
          <Textarea
            value={getStepValue(step).description}
            onChange={(e) =>
              handleChangeStepValue(step, 'description', e.target.value)
            }
            className="w-full"
          />
        </div>
      )}

      <div className="grid grid-cols-2 p-4 gap-2">
        <SortableContext items={stepFields} strategy={rectSortingStrategy}>
          {stepFields?.length > 0 &&
            stepFields?.map((field) => (
              <FormDndField key={field} field={field} step={step} />
            ))}
        </SortableContext>
      </div>
    </InfoCard.Content>
  );
};

export const AddStep = () => {
  const { steps, setSteps, fields } = useFormDnd();

  function getNextStepId() {
    const stepIds = Object.keys(fields).length;
    return (stepIds + 1).toString();
  }
  const handleAddStep = () => {
    const newStepId = getNextStepId();
    setSteps([...steps, newStepId.toString()]);
  };
  return (
    <Button
      variant="outline"
      className="h-12 w-full rounded-lg shadow-none border-dashed border"
      onClick={handleAddStep}
    >
      <IconPlus /> Add Step
    </Button>
  );
};
