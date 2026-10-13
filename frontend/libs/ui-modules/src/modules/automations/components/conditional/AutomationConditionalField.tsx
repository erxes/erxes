import { IconGitBranch, IconX } from '@tabler/icons-react';
import { Button, Form } from 'erxes-ui';
import { ReactElement } from 'react';
import { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { useAutomationConditionalField } from '../../hooks/useAutomationConditionalField';
import { TAutomationConditionalFieldRender } from '../../types/conditionalTypes';
import { AutomationConditionalSummary } from './AutomationConditionalSummary';

type TAutomationConditionalFieldProps = {
  form: UseFormReturn<FieldValues>;
  names: string[];
  label: string;
  required?: boolean;
  render: TAutomationConditionalFieldRender;
};

/**
 * Drop-in for Form.Field on an action config: the same render, plus a way to
 * make the value depend on conditions. `names` lists every key the input
 * writes (a stage picker writes value and meta); the first holds the token.
 */
export const AutomationConditionalField = <TValues extends FieldValues>({
  form: typedForm,
  names,
  ...rest
}: Omit<TAutomationConditionalFieldProps, 'form' | 'names'> & {
  form: UseFormReturn<TValues>;
  names: Path<TValues>[];
}) => {
  // Rows keep their own untyped forms, so the action's typed form is widened
  // once here; react-hook-form offers no variance between the two
  const form = typedForm as unknown as UseFormReturn<FieldValues>;
  const props = { ...rest, form, names };

  return (
    <Form.Field
      control={form.control}
      name={names[0]}
      render={(fieldProps) => (
        <AutomationConditionalFieldBody
          {...props}
          renderPlain={() => props.render({ ...fieldProps, form })}
        />
      )}
    />
  );
};

const AutomationConditionalFieldBody = ({
  form,
  names,
  label,
  required,
  render,
  renderPlain,
}: TAutomationConditionalFieldProps & {
  renderPlain: () => ReactElement;
}) => {
  const {
    isSupported,
    isConditional,
    isBroken,
    conditional,
    errors,
    enable,
    disable,
    edit,
  } = useAutomationConditionalField({ form, names, label, required, render });

  return (
    <Form.Item>
      <div className="flex items-center justify-between gap-2">
        <Form.Label>
          {label}
          {required && <span className="text-destructive">*</span>}
        </Form.Label>
        {isSupported && (
          <Button
            type="button"
            variant={isConditional ? 'secondary' : 'ghost'}
            size="sm"
            onClick={isConditional ? disable : enable}
          >
            {isConditional ? (
              <IconX className="size-4" />
            ) : (
              <IconGitBranch className="size-4" />
            )}
            {isConditional ? 'Use one value' : 'Make conditional'}
          </Button>
        )}
      </div>

      {!isConditional && renderPlain()}

      {isBroken && (
        <p className="text-sm text-destructive">
          This value lost its conditions. Switch back to one value to set it
          again.
        </p>
      )}

      {conditional && (
        <AutomationConditionalSummary
          conditional={conditional}
          form={form}
          names={names}
          render={render}
          onEdit={edit}
        />
      )}

      {errors.length > 0 && (
        <ul className="flex flex-col gap-0.5 text-sm text-destructive">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <Form.Message />
    </Form.Item>
  );
};
