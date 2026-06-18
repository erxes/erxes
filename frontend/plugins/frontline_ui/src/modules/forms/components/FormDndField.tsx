import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { useFormDnd } from './FormDndProvider';
import { useMountStatus } from '../hooks/useMountStatus';
import { Button, cn, DropdownMenu } from 'erxes-ui';
import { CSS } from '@dnd-kit/utilities';
import {
  IconCheck,
  IconCalendarEvent,
  IconNumbers,
  IconPaperclip,
  IconPlus,
  IconTextScan2,
  IconTextSize,
  IconChevronDown,
  IconDots,
  IconEdit,
  IconTrash,
  IconListCheck,
  IconListDetails,
  IconUserCircle,
  IconAt,
  IconPhoneSpark,
  IconGenderBigender,
  IconAddressBook,
  IconChevronLeft,
  IconWorld,
} from '@tabler/icons-react';
import { FORM_FIELD_TYPES, GroupedFields } from '../constants/formFieldTypes';
import React, { useState } from 'react';
import { FormFieldDetail, FormFieldDetailSheet } from './FormFieldDetail';
import { FORM_GROUP_LABELS } from '../constants/formGroupLabels';

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
    case 'select:countries':
      return <IconWorld />;
    case 'textarea':
      return <IconTextScan2 />;
    case 'radio':
      return <IconListCheck />;
    case 'check':
      return <IconListDetails />;
    case 'file':
      return <IconPaperclip />;
    case 'core:customer:avatar':
      return <IconUserCircle />;
    case 'core:customer:email':
      return <IconAt />;
    case 'core:customer:phone':
      return <IconPhoneSpark />;
    case 'core:customer:sex':
      return <IconGenderBigender />;
    case 'core:customer:birthDate':
      return <IconCalendarEvent />;
    default:
      return <IconTextSize />;
  }
};

export const AddField = ({ step }: { step: UniqueIdentifier }) => {
  const { handleAddField } = useFormDnd();
  const [view, setView] = useState<'main' | 'customer'>('main');

  const GROUPED_FIELD_TYPES: GroupedFields = FORM_FIELD_TYPES.reduce(
    (groups, type) => {
      const group = type.value.startsWith('core:customer:')
        ? 'core:customer'
        : 'basic';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(type);
      return groups;
    },
    {} as Record<'basic' | 'core:customer', typeof FORM_FIELD_TYPES>,
  );

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (!open) setView('main');
      }}
    >
      <DropdownMenu.Trigger asChild>
        <Button variant="secondary" className="ml-auto">
          <IconPlus /> Add Field
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {view === 'main' ? (
          <>
            <DropdownMenu.Label className="font-bold">
              {FORM_GROUP_LABELS.basic.label}
            </DropdownMenu.Label>

            {GROUPED_FIELD_TYPES.basic.map((type) => (
              <DropdownMenu.Item
                key={type.value}
                onClick={() => handleAddField(step, type)}
              >
                <FormDndFieldIcon type={type.value} />
                {type.label}
              </DropdownMenu.Item>
            ))}

            <DropdownMenu.Separator />

            <DropdownMenu.Label className="font-bold">
              {FORM_GROUP_LABELS['core:customer'].label}
            </DropdownMenu.Label>

            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                setView('customer');
              }}
            >
              <IconAddressBook /> Customer fields
            </DropdownMenu.Item>
          </>
        ) : (
          <>
            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                setView('main');
              }}
              className="text-accent-foreground text-xs"
            >
              <IconChevronLeft /> Back
            </DropdownMenu.Item>

            <DropdownMenu.Label className="font-bold">
              Customer fields
            </DropdownMenu.Label>

            {GROUPED_FIELD_TYPES['core:customer'].map((type) => (
              <DropdownMenu.Item
                key={type.value}
                onClick={() => handleAddField(step, type)}
              >
                <FormDndFieldIcon type={type.value} />
                {type.label}
              </DropdownMenu.Item>
            ))}
          </>
        )}
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
