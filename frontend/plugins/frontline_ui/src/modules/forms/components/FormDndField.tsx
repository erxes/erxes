import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { useFormDnd } from './FormDndProvider';
import { useMountStatus } from '../hooks/useMountStatus';
import { Button, cn, DropdownMenu, toast } from 'erxes-ui';
import { CSS } from '@dnd-kit/utilities';
import {
  IconCheck,
  IconCalendarEvent,
  IconNumbers,
  IconPlus,
  IconTextScan2,
  IconTextSize,
  IconChevronDown,
  IconDots,
  IconEdit,
  IconTrash,
  IconListCheck,
  IconListDetails,
} from '@tabler/icons-react';
import { FORM_FIELD_TYPES } from '../constants/formFieldTypes';
import React, { useState } from 'react';
import { FormFieldDetail, FormFieldDetailSheet } from './FormFieldDetail';
import { useRemoveForm } from '../hooks/useRemoveForm';

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
          'p-1 text-sm border rounded-md flex items-center px-2 [&>svg]:size-4 gap-2',
          fieldData?.span === 2 && 'col-span-2',
          mountedWhileDragging && 'fade-in',
        )}
        ref={setNodeRef}
        style={{ transition, transform: CSS.Translate.toString(transform) }}
        {...listeners}
      >
        <FormDndFieldIcon type={fieldData?.type ?? 'text'} />
        {fieldData?.label}
        <FieldContextMenu fieldId={field} stepId={step} setOpen={setOpen} />
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

export const FormDndFieldIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'number':
      return <IconNumbers />;
    case 'boolean':
      return <IconCheck />;
    case 'date':
      return <IconCalendarEvent />;
    case 'select':
      return <IconChevronDown />;
    case 'textarea':
      return <IconTextScan2 />;
    case 'radio':
      return <IconListCheck />;
    case 'check':
      return <IconListDetails />;
    default:
      return <IconTextSize />;
  }
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
            <FormDndFieldIcon type={type.value} />
            {type.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const FieldContextMenu = ({
  fieldId,
  stepId,
  setOpen,
}: {
  fieldId: UniqueIdentifier;
  stepId: UniqueIdentifier;
  setOpen: (open: boolean) => void;
}) => {
  const [_open, _setOpen] = React.useState<boolean>(false);
  const { handleDeleteField } = useFormDnd();
  const handleRemoveField = () => {
    handleDeleteField(stepId, fieldId);
  };

  return (
    <DropdownMenu open={_open} onOpenChange={_setOpen}>
      <DropdownMenu.Trigger className="ml-auto">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={() => setOpen(true)}>
          <IconEdit />
          Edit attributes
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={handleRemoveField}
          className="text-destructive"
        >
          <IconTrash />
          Remove Field
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
