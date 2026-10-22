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
  IconDragDrop2,
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
import React, { useEffect, useRef, useState } from 'react';
import { FormFieldDetail, FormFieldDetailSheet } from './FormFieldDetail';
import { FORM_GROUP_LABELS } from '../constants/formGroupLabels';
import { useTranslation } from 'react-i18next';

const DRAG_DISTANCE = 10;

export const FormDndField = ({
  field,
  step,
}: {
  field: UniqueIdentifier;
  step: UniqueIdentifier;
}) => {
  const [open, setOpen] = useState(false);
  const pointerDownAt = useRef<{ x: number; y: number } | null>(null);
  const {
    attributes,
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: field,
  });
  const { getFieldValue, newFieldId, clearNewFieldId } = useFormDnd();
  const fieldData = getFieldValue(step, field);
  const mounted = useMountStatus();

  useEffect(() => {
    if (newFieldId !== field) return;

    setOpen(true);
    clearNewFieldId();
  }, [newFieldId, field, clearNewFieldId]);

  const mountedWhileDragging = isDragging && !mounted;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const start = pointerDownAt.current;
    pointerDownAt.current = null;
    if (
      start &&
      Math.hypot(e.clientX - start.x, e.clientY - start.y) >= DRAG_DISTANCE
    ) {
      return;
    }
    setOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'Enter') return;
    if (isDragging) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ') e.preventDefault();
  };

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
          'group p-1 text-sm border rounded-md flex items-center px-2 gap-2 min-w-0 cursor-grab bg-background hover:border-muted-foreground/40',
          fieldData?.span === 2 && 'col-span-2',
          mountedWhileDragging && 'fade-in',
          isDragging &&
            'relative z-10 cursor-grabbing shadow-lg border-primary ring-2 ring-primary/20',
        )}
        ref={setNodeRef}
        style={{ transition, transform: CSS.Translate.toString(transform) }}
        {...listeners}
      >
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          className="flex flex-1 items-center gap-2 min-w-0 text-left cursor-[inherit] rounded-sm [&>svg]:size-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          onPointerDown={(e) => {
            pointerDownAt.current = { x: e.clientX, y: e.clientY };
          }}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
        >
          <IconDragDrop2 className="shrink-0 text-muted-foreground opacity-60 group-hover:opacity-100" />
          <FormDndFieldIcon type={fieldData?.type ?? 'text'} />
          <span className="truncate min-w-0">{fieldData?.label}</span>
        </button>
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
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
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
          <IconPlus /> {t('add-field', 'Add Field')}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {view === 'main' ? (
          <>
            <DropdownMenu.Label className="font-bold">
              {t(FORM_GROUP_LABELS.basic.labelKey)}
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
              {t(FORM_GROUP_LABELS['core:customer'].labelKey)}
            </DropdownMenu.Label>

            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                setView('customer');
              }}
            >
              <IconAddressBook /> {t('customer-fields', 'Customer fields')}
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
              <IconChevronLeft /> {t('back', 'Back')}
            </DropdownMenu.Item>

            <DropdownMenu.Label className="font-bold">
              {t('customer-fields', 'Customer fields')}
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
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.forms' });
  const [_open, _setOpen] = React.useState<boolean>(false);
  const { handleDeleteField } = useFormDnd();
  const handleRemoveField = () => {
    handleDeleteField(stepId, fieldId);
  };

  return (
    <DropdownMenu open={_open} onOpenChange={_setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content onClick={(e) => e.stopPropagation()}>
        <DropdownMenu.Item onClick={() => setOpen(true)}>
          <IconEdit />
          {t('edit-attributes', 'Edit attributes')}
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={handleRemoveField}
          className="text-destructive"
        >
          <IconTrash />
          {t('remove-field', 'Remove Field')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
