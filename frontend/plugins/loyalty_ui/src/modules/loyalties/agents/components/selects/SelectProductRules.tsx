import { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import { Combobox, Command, Form, Popover } from 'erxes-ui';
import { AGENT_PRODUCT_RULES_QUERY } from '../../graphql/queries/queries';

interface IProductRule {
  _id: string;
  name: string;
}

interface SelectProductRulesProps {
  value: string[];
  onValueChange: (ids: string[]) => void;
  placeholder?: string;
}

export const SelectProductRules = ({
  value,
  onValueChange,
  placeholder,
}: SelectProductRulesProps) => {
  const [open, setOpen] = useState(false);

  const { data, loading } = useQuery(AGENT_PRODUCT_RULES_QUERY);
  const rules: IProductRule[] = data?.productRules || [];

  const selectedNames = rules
    .filter((r) => value.includes(r._id))
    .map((r) => r.name)
    .join(', ');

  const handleToggle = useCallback(
    (id: string) => {
      if (value.includes(id)) {
        onValueChange(value.filter((v) => v !== id));
      } else {
        onValueChange([...value, id]);
      }
    },
    [value, onValueChange],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.Trigger className="w-full shadow-xs">
          {selectedNames || (
            <span className="text-accent-foreground/80">
              {placeholder || 'Choose product rule'}
            </span>
          )}
        </Combobox.Trigger>
      </Form.Control>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder="Search rules..." />
          <Command.Empty>
            <span className="text-muted-foreground">
              {loading ? 'Loading...' : 'No rules found'}
            </span>
          </Command.Empty>
          <Command.List>
            {rules.map((rule) => (
              <Command.Item
                key={rule._id}
                value={rule._id}
                onSelect={() => handleToggle(rule._id)}
              >
                <span>{rule.name}</span>
                <Combobox.Check checked={value.includes(rule._id)} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
