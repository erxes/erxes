import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { useFormDnd } from './FormDndProvider';
import { useMountStatus } from '../hooks/useMountStatus';
import { Button, cn, DropdownMenu } from 'erxes-ui';
import { CSS } from '@dnd-kit/utilities';
import { IconArrowsDiagonal, IconPlus } from '@tabler/icons-react';
import { FORM_FIELD_TYPES } from '../constants/formFieldTypes';
import { useState } from 'react';
import { FormFieldDetail, FormFieldDetailSheet } from './FormFieldDetail';

export const FormDndField = ({
  field,
  step,
}: {
  field: UniqueIdentifier;
  step: UniqueIdentifier;
}) => {
  const [open, setOpen] = useState(false);
  const { setNodeRef, listeners, isDragging, transform, transition } =
    useSortable({
      id: field,
    });
  const { getFieldValue, handleChangeField } = useFormDnd();
  const fieldData = getFieldValue(step, field);
  const mounted = useMountStatus();

  const mountedWhileDragging = isDragging && !mounted;

  // const handleChangeSpan = (span: number) => {
  //   fieldData &&
  //     handleChangeField(step, field, {
  //       ...fieldData,
  //       span,
  //     });
  // };

  return (
    <>
      <div
        className={cn(
          'p-1 text-sm border rounded-md flex items-center justify-between px-2',
          fieldData?.span === 2 && 'col-span-2',
          mountedWhileDragging && 'fade-in',
        )}
        ref={setNodeRef}
        style={{ transition, transform: CSS.Translate.toString(transform) }}
        {...listeners}
      >
        {fieldData?.label}
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <IconArrowsDiagonal />
        </Button>
      </div>
      <FormFieldDetailSheet open={open} onOpenChange={setOpen}>
        <FormFieldDetail
          fieldData={fieldData}
          fieldId={field}
          stepId={step}
          handleClose={() => setOpen(false)}
        />
      </FormFieldDetailSheet>
    </>
  );
};

export const AddField = ({ step }: { step: UniqueIdentifier }) => {
  const { handleAddField } = useFormDnd();
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" className="ml-auto">
          <IconPlus /> Add Field
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        {FORM_FIELD_TYPES.map((type) => (
          <DropdownMenu.Item
            key={type.value}
            onClick={() => handleAddField(step, type)}
          >
            {type.icon}
            {type.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
