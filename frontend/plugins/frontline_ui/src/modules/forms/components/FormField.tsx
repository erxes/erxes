import {
  IconChevronDown,
  IconGripVertical,
  IconTrash,
} from '@tabler/icons-react';
import { FORM_FIELD_TYPES } from '../constants/formFieldTypes';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { z } from 'zod';
import { Button, Collapsible, Input, cn } from 'erxes-ui';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const ErxesFormField = ({
  field,
  remove,
  isDragOverlay = false,
}: {
  field: z.infer<typeof FORM_CONTENT_SCHEMA>['fields'][number];
  remove: () => void;
  isDragOverlay?: boolean;
}) => {
  const fieldType = FORM_FIELD_TYPES.find((type) => type.value === field.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    disabled: isDragOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const span = field.span || 1;

  return (
    <Collapsible>
      <div
        ref={isDragOverlay ? undefined : setNodeRef}
        style={style}
        className={cn(
          'flex flex-col gap-2 shadow-xs p-2 rounded-lg [&_svg]:size-4 group/field',
          isDragging && !isDragOverlay && 'cursor-grabbing shadow-lg',
          isDragOverlay && 'shadow-lg rotate-2',
          span === 2 && 'col-span-2',
        )}
      >
        <div className="flex items-center gap-2 w-full">
          <div
            ref={setActivatorNodeRef}
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <IconGripVertical className="w-4 h-4 text-gray-400" />
          </div>
          {fieldType?.icon}
          {field.label}
          <Collapsible.Trigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto group-hover/field:opacity-100 transition-opacity opacity-0"
            >
              <IconChevronDown />
            </Button>
          </Collapsible.Trigger>
          <Button
            variant="ghost"
            size="icon"
            className="group-hover/field:opacity-100 transition-opacity opacity-0"
            onClick={remove}
          >
            <IconTrash />
          </Button>
        </div>
        <Collapsible.Content></Collapsible.Content>
      </div>
    </Collapsible>
  );
};

export const FieldTextSettings = () => {
  return (
    <div>
      <Input />
    </div>
  );
};
