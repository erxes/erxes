import { BROADCAST_RULES } from '@/broadcast/constants';
import { Form, Select, Tooltip } from 'erxes-ui';

export const BroadcastSelectRule = ({
  values,
  onValueChange,
}: {
  values: Record<string, string>[];
  onValueChange: (value: string) => void;
}) => {
  const AVAILABLE_RULES = Object.keys(BROADCAST_RULES).filter(
    (key) => !values.some((field) => field.rule === key),
  );

  if (AVAILABLE_RULES.length === 0) {
    return null;
  }

  return (
    <Select value="" onValueChange={onValueChange}>
      <Form.Control>
        <Select.Trigger>
          <Select.Value
            placeholder="Select rule"
            className="text-muted-foreground"
          >
            Select rule
          </Select.Value>
        </Select.Trigger>
      </Form.Control>
      <Select.Content>
        <Select.Group>
          {AVAILABLE_RULES.map((key) => {
            const { title, description } = BROADCAST_RULES[key];

            return (
              <Tooltip.Provider key={key}>
                <Tooltip delayDuration={1000}>
                  <Tooltip.Trigger asChild>
                    <Select.Item key={key} className="text-xs h-7" value={key}>
                      {title}
                    </Select.Item>
                  </Tooltip.Trigger>
                  <Tooltip.Content
                    className="max-w-96"
                    side="right"
                    align="start"
                  >
                    {description}
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            );
          })}
        </Select.Group>
      </Select.Content>
    </Select>
  );
};
