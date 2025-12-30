import { Button, DropdownMenu } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { FORM_FIELD_TYPES } from '../constants/formFieldTypes';
import { FORM_CONTENT_SCHEMA } from '../constants/formSchema';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { UseFieldArrayReturn } from 'react-hook-form';

interface FormFieldActionsProps {
  steps: z.infer<typeof FORM_CONTENT_SCHEMA>['steps'];
  appendStep: UseFieldArrayReturn<
    z.infer<typeof FORM_CONTENT_SCHEMA>,
    'steps',
    'id'
  >['append'];
  appendField: UseFieldArrayReturn<
    z.infer<typeof FORM_CONTENT_SCHEMA>,
    'fields',
    'id'
  >['append'];
  getFirstStepId: () => string;
}

export function FormFieldActions({
  steps,
  appendStep,
  appendField,
  getFirstStepId,
}: FormFieldActionsProps) {
  return (
    <div className="flex justify-between items-center mt-4 pt-4 border-t">
      <Button
        variant="secondary"
        onClick={() => {
          appendStep({
            id: `step-${nanoid()}`,
            label: `Step ${steps.length + 1}`,
          });
        }}
      >
        <IconPlus /> Add step
      </Button>
      <DropdownMenu>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary">
            <IconPlus /> Add field
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {FORM_FIELD_TYPES.map((type) => (
            <DropdownMenu.Item
              key={type.value}
              onClick={() => {
                const firstStepId = getFirstStepId();
                appendField({
                  id: nanoid() as string,
                  type: type.value,
                  label: type.label,
                  placeholder: '',
                  description: '',
                  required: false,
                  options: [],
                  stepId: firstStepId,
                  span: 1,
                });
              }}
            >
              {type.icon}
              {type.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu>
    </div>
  );
}

