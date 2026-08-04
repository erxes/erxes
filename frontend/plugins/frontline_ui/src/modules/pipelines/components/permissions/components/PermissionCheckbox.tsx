import { Checkbox, Form } from 'erxes-ui';
import { ControllerRenderProps } from 'react-hook-form';

interface PermissionCheckboxProps {
  field: ControllerRenderProps<any, any>;
  title: string;
  description: string;
}

export const PermissionCheckbox = ({
  field,
  title,
  description,
}: PermissionCheckboxProps) => (
  <Form.Item>
    <label
      className={`
        flex gap-3 p-4 rounded-xl border cursor-pointer transition-all
        ${
          field.value
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/40'
        }
      `}
    >
      <Checkbox
        checked={field.value}
        onCheckedChange={field.onChange}
        className="mt-1"
      />
      <div className="space-y-1">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </label>
  </Form.Item>
);
