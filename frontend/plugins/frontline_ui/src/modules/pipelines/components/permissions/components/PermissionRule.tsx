import { Form, Switch } from 'erxes-ui';
import { ControllerRenderProps } from 'react-hook-form';
import { PermissionState } from '@/pipelines/types';

type PermissionRuleName =
  | 'dayAfterCreated'
  | 'branchOnly'
  | 'myTicketsOnly'
  | 'departmentOnly';

interface PermissionRuleProps {
  field: ControllerRenderProps<PermissionState, PermissionRuleName>;
  label: string;
}

export const PermissionRule = ({ field, label }: PermissionRuleProps) => (
  <Form.Item className="flex flex-row items-center justify-between gap-6 space-y-0 py-2.5">
    <Form.Label className="text-sm font-normal text-foreground" variant="peer">
      {label}
    </Form.Label>
    <Form.Control>
      <Switch
        checked={field.value}
        className="flex-none"
        onCheckedChange={field.onChange}
      />
    </Form.Control>
  </Form.Item>
);
