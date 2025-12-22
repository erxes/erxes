import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Label } from 'erxes-ui';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { BROADCAST_RULES } from '../constants';
import { BroadcastSelectRule } from './select/BroadcastSelectRule';
import { BroadcastSelectRuleCondition } from './select/BroadcastSelectRuleCondition';

export const BroadcastRules = () => {
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'rules',
  });

  return (
    <div className="flex flex-col gap-3">
      {fields.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          <Label>Condition</Label>
          <Label>Value</Label>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Label>Add rules</Label>
        </div>
      )}
      {fields.map(({ id, rule }, index) => {
        const { placeholder } = BROADCAST_RULES[rule];

        return (
          <div className="grid grid-cols-2 gap-3" key={id}>
            <Form.Field
              name={`rules.${index}.condition`}
              control={control}
              render={({ field }) => (
                <Form.Item className="flex-auto">
                  <Form.Control>
                    <BroadcastSelectRuleCondition
                      rule={rule}
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <div className="flex gap-3">
              <Form.Field
                name={`rules.${index}.value`}
                control={control}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Input {...field} placeholder={placeholder} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Button
                variant="secondary"
                size="icon"
                className="bg-destructive/20 text-destructive size-8 hover:bg-destructive/30"
                onClick={() => remove(index)}
              >
                <IconTrash />
              </Button>
            </div>
          </div>
        );
      })}

      <BroadcastSelectRule
        values={fields}
        onValueChange={(value) =>
          append({
            rule: value,
            condition: '',
            value: '',
          })
        }
      />
    </div>
  );
};
