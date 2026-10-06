import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { useFormDnd } from '@/forms/components/FormDndProvider';
import { useMountStatus } from '@/forms/hooks/useMountStatus';
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
  IconBuilding,
  IconBriefcase,
  IconUsersGroup,
  IconWorldWww,
} from '@tabler/icons-react';
import {
  FORM_FIELD_TYPES,
  FormGroupKey,
  GroupedFields,
} from '@/forms/constants/formFieldTypes';
import React, { useState } from 'react';
import {
  FormFieldDetail,
  FormFieldDetailSheet,
} from '@/forms/components/FormFieldDetail';
import { FORM_GROUP_LABELS } from '@/forms/constants/formGroupLabels';
import { useTranslation } from 'react-i18next';

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
          'p-1 text-sm border rounded-md flex items-center px-2 [&>svg]:size-4 gap-2 min-w-0',
          fieldData?.span === 2 && 'col-span-2',
          mountedWhileDragging && 'fade-in',
        )}
        ref={setNodeRef}
        style={{ transition, transform: CSS.Translate.toString(transform) }}
        {...listeners}
      >
        <FormDndFieldIcon type={fieldData?.type ?? 'text'} />
        <span className="truncate min-w-0">{fieldData?.label}</span>
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
    case 'core:company:avatar':
      return <IconUserCircle />;
    case 'core:customer:email':
    case 'core:company:primaryEmail':
      return <IconAt />;
    case 'core:customer:phone':
    case 'core:company:primaryPhone':
      return <IconPhoneSpark />;
    case 'core:customer:sex':
      return <IconGenderBigender />;
    case 'core:customer:birthDate':
      return <IconCalendarEvent />;
    case 'core:company:primaryName':
      return <IconBuilding />;
    case 'core:company:website':
      return <IconWorldWww />;
    case 'core:company:industry':
      return <IconBriefcase />;
    case 'core:company:size':
      return <IconUsersGroup />;
    default:
      return <IconTextSize />;
  }
};

export const AddField = ({ step }: { step: UniqueIdentifier }) => {
  const { t } = useTranslation('frontline');
  const { handleAddField } = useFormDnd();
  const [view, setView] = useState<'main' | 'customer' | 'company'>('main');

  const GROUPED_FIELD_TYPES: GroupedFields = FORM_FIELD_TYPES.reduce(
    (groups, type) => {
      let group: FormGroupKey = 'basic';
      if (type.value.startsWith('core:customer:')) {
        group = 'core:customer';
      } else if (type.value.startsWith('core:company:')) {
        group = 'core:company';
      }
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(type);
      return groups;
    },
    {} as GroupedFields,
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
              <IconAddressBook /> {t('customer-fields', 'Customer fields')}
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                setView('company');
              }}
            >
              <IconBuilding /> {t('company-fields', 'Company fields')}
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
              {view === 'company'
                ? t('company-fields', 'Company fields')
                : t('customer-fields', 'Customer fields')}
            </DropdownMenu.Label>

            {GROUPED_FIELD_TYPES[
              view === 'company' ? 'core:company' : 'core:customer'
            ].map((type) => (
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
  const { t } = useTranslation('frontline');
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
