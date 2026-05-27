import { IconSquareKey, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Input, Select } from 'erxes-ui';
import { DIRECT_MESSAGE_OPERATOR_TYPES } from '../../constants/messageTriggerOptions';
import { useDirectMessageConditionCard } from '../../hooks/useDirectMessageConditionCard';
import { TMessageTriggerDirectConditions } from '../../types/messageTrigger';

export const DirectMessageConditionCard = ({
  condition,
  onChange,
  onRemove,
}: {
  condition: TMessageTriggerDirectConditions[number];
  onChange: (
    name: 'operator' | 'keywords',
    value:
      | TMessageTriggerDirectConditions[number]['keywords']
      | TMessageTriggerDirectConditions[number]['operator'],
  ) => void;
  onRemove: () => void;
}) => {
  const {
    hasKeywords,
    handleKeyPress,
    onRemoveConditionKeyword,
    onChangeKeyword,
    toggleKeywordState,
    handleBlur,
  } = useDirectMessageConditionCard({
    condition,
    onChange,
  });

  return (
    <div className="group relative mt-4 rounded-md border p-4 hover:shadow">
      <Button
        variant="destructive"
        size="icon"
        onClick={onRemove}
        className="absolute -top-4 right-2 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <IconTrash />
      </Button>

      <div className="flex flex-col gap-2">
        <Select
          value={condition.operator}
          onValueChange={(value) => onChange('operator', value)}
        >
          <Select.Trigger>
            <Select.Value placeholder="Select..." />
          </Select.Trigger>
          <Select.Content>
            {DIRECT_MESSAGE_OPERATOR_TYPES.map(({ label, value }) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>

        <Input placeholder="+ add keyword" onKeyDown={handleKeyPress} />

        {!hasKeywords ? (
          <div className="flex flex-col items-center text-muted-foreground">
            <IconSquareKey />
            <span className="text-xs">There is no keywords configured</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-4 py-4">
            {(condition.keywords || []).map(({ _id, text, isEditing }) => (
              <Badge
                key={_id}
                id={_id}
                onDoubleClick={toggleKeywordState}
                onClose={() => onRemoveConditionKeyword(_id)}
              >
                {isEditing ? (
                  <Input
                    key={_id}
                    id={_id}
                    variant="secondary"
                    value={text}
                    onBlur={handleBlur}
                    onKeyDown={onChangeKeyword}
                    className="h-full bg-transparent"
                  />
                ) : (
                  text
                )}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
