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
  IconBuilding,
  IconBriefcase,
  IconHash,
  IconMapPin,
  IconUsers,
} from '@tabler/icons-react';
import {
  FORM_FIELD_TYPES,
  FormFieldType,
  FormGroupKey,
  GroupedFields,
} from '../constants/formFieldTypes';
import React, { useState } from 'react';
import { FormFieldDetail, FormFieldDetailSheet } from './FormFieldDetail';
import { FORM_GROUP_LABELS } from '../constants/formGroupLabels';
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
  const { getFieldValue } = useFormDnd();
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
      return <IconUserCircle />;
    case 'core:customer:email':
      return <IconAt />;
    case 'core:customer:phone':
      return <IconPhoneSpark />;
    case 'core:customer:sex':
      return <IconGenderBigender />;
    case 'core:customer:birthDate':
      return <IconCalendarEvent />;
    case 'core:company:primaryName':
      return <IconBuilding />;
    case 'core:company:primaryEmail':
      return <IconAt />;
    case 'core:company:primaryPhone':
      return <IconPhoneSpark />;
    case 'core:company:website':
      return <IconWorld />;
    case 'core:company:size':
    case 'core:company:employees':
      return <IconUsers />;
    case 'core:company:businessType':
      return <IconBriefcase />;
    case 'core:company:location':
      return <IconMapPin />;
    case 'core:company:code':
      return <IconHash />;
    case 'core:company:avatar':
      return <IconUserCircle />;
    default:
      return <IconTextSize />;
  }
};

type CoreFieldsView = 'customer' | 'company';

const CORE_FIELDS_GROUP: Record<CoreFieldsView, FormGroupKey> = {
  customer: 'core:customer',
  company: 'core:company',
};

const getFieldGroup = (value: string): FormGroupKey => {
  if (value.startsWith('core:customer:')) return 'core:customer';
  if (value.startsWith('core:company:')) return 'core:company';
  return 'basic';
};

const FieldTypeItems = ({
  step,
  types = [],
}: {
  step: UniqueIdentifier;
  types?: FormFieldType[];
}) => {
  const { handleAddField } = useFormDnd();

  return (
    <>
      {types.map((type) => (
        <DropdownMenu.Item
          key={type.value}
          onClick={() => handleAddField(step, type)}
        >
          <FormDndFieldIcon type={type.value} />
          {type.label}
        </DropdownMenu.Item>
      ))}
    </>
  );
};

export const AddField = ({ step }: { step: UniqueIdentifier }) => {
  const { t } = useTranslation('frontline');
  const [view, setView] = useState<'main' | CoreFieldsView>('main');

  const coreFieldsMenus: {
    view: CoreFieldsView;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      view: 'customer',
      label: t('customer-fields', 'Customer fields'),
      icon: <IconAddressBook />,
    },
    {
      view: 'company',
      label: t('company-fields', 'Company fields'),
      icon: <IconBuilding />,
    },
  ];

  const GROUPED_FIELD_TYPES = FORM_FIELD_TYPES.reduce((groups, type) => {
    const group = getFieldGroup(type.value);
    groups[group] = [...(groups[group] || []), type];
    return groups;
  }, {} as GroupedFields);

  const activeMenu = coreFieldsMenus.find((menu) => menu.view === view);

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
        {activeMenu ? (
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
              {activeMenu.label}
            </DropdownMenu.Label>

            <FieldTypeItems
              step={step}
              types={GROUPED_FIELD_TYPES[CORE_FIELDS_GROUP[activeMenu.view]]}
            />
          </>
        ) : (
          <>
            <DropdownMenu.Label className="font-bold">
              {FORM_GROUP_LABELS.basic.label}
            </DropdownMenu.Label>

            <FieldTypeItems step={step} types={GROUPED_FIELD_TYPES.basic} />

            <DropdownMenu.Separator />

            <DropdownMenu.Label className="font-bold">
              {FORM_GROUP_LABELS['core:customer'].label}
            </DropdownMenu.Label>

            {coreFieldsMenus.map((menu) => (
              <DropdownMenu.Item
                key={menu.view}
                onSelect={(e) => {
                  e.preventDefault();
                  setView(menu.view);
                }}
              >
                {menu.icon} {menu.label}
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
