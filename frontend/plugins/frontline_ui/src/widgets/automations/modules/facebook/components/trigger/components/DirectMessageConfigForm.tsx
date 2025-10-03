import { IconSquareKey, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Input, Select } from 'erxes-ui';
import { generateAutomationElementId } from 'ui-modules';
import { DIRECT_MESSAGE_OPERATOR_TYPES } from '../constants/messageTriggerForm';
import {
  TMessageTriggerForm,
  TMessageTriggerFormDirectMessage,
  TMessageTriggerFormPersistentMenu,
} from '../states/messageTriggerFormSchema';

const DirectMessageCondition = ({
  condition,
  onChange,
}: {
  condition: TMessageTriggerFormDirectMessage[number];
  onChange: (
    name: 'operator' | 'keywords',
    value:
      | TMessageTriggerFormDirectMessage[number]['keywords']
      | TMessageTriggerFormDirectMessage[number]['operator'],
  ) => void;
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const { value } = e.currentTarget;

      onChange('keywords', [
        ...condition.keywords,
        { _id: generateAutomationElementId(), text: value },
      ]);
      e.currentTarget.value = '';
    }
  };

  const onRemoveConditionKeyword = (_id: string) => {
    onChange(
      'keywords',
      condition.keywords.filter((keyword) => keyword._id !== _id),
    );
  };

  const onChangeKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { id, value } = e.currentTarget;
    if (e.key === 'Enter') {
      onChange(
        'keywords',
        condition.keywords.map((keyword) =>
          keyword._id === id
            ? { ...keyword, text: value, isEditing: false }
            : keyword,
        ),
      );
    }
  };

  const toggleKeywordState = (e: React.MouseEvent<HTMLDivElement>) => {
    const { id } = e.currentTarget;
    onChange(
      'keywords',
      condition.keywords.map((keyword) =>
        keyword._id === id ? { ...keyword, isEditing: true } : keyword,
      ),
    );
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, ...others } = e.currentTarget;
    onChange(
      'keywords',
      condition.keywords.map((keyword) =>
        keyword._id === id ? { ...keyword, isEditing: false } : keyword,
      ),
    );
  };

  const renderKeywords = () => {
    if (!condition.keywords.length) {
      return (
        <div className="text-muted-foreground flex flex-col items-center">
          <IconSquareKey />
          <span className="text-xs">There is no keywords configured</span>
        </div>
      );
    }

    return (
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
    );
  };

  return (
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

      {renderKeywords()}
    </div>
  );
};

type Props = {
  conditions: TMessageTriggerFormDirectMessage;
  // botId: TMessageTriggerForm['botId'];
  onConditionChange: (
    fieldName: 'persistentMenuIds' | 'conditions',
    fieldValue:
      | TMessageTriggerFormDirectMessage
      | TMessageTriggerFormPersistentMenu,
  ) => void;
};

export const DirectMessageConfigForm = ({
  conditions = [],
  // botId,
  onConditionChange,
}: Props) => {
  const onRemoveCondition = (id: string) => {
    onConditionChange(
      'conditions',
      conditions.filter((cond) => cond._id !== id),
    );
  };

  const onAddCondition = () => {
    onConditionChange('conditions', [
      ...conditions,
      { _id: generateAutomationElementId(), operator: '', keywords: [] },
    ]);
  };

  return (
    <div>
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onAddCondition}>
          + Add condition
        </Button>
      </div>
      {conditions.map((condition) => {
        const onChange = (
          name: 'operator' | 'keywords',
          value:
            | TMessageTriggerFormDirectMessage[number]['keywords']
            | TMessageTriggerFormDirectMessage[number]['operator'],
        ) => {
          onConditionChange(
            'conditions',
            conditions.map((cond) =>
              condition._id === cond._id ? { ...cond, [name]: value } : cond,
            ),
          );
        };

        return (
          <div
            className="border rounded-md p-4 relative group mt-4 hover:shadow"
            key={condition._id}
          >
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onRemoveCondition(condition._id)}
              className={`absolute -top-4 right-2 opacity-0 group-hover:opacity-100 transition-opacity`}
            >
              <IconTrash />
            </Button>
            <DirectMessageCondition condition={condition} onChange={onChange} />
          </div>
        );
      })}
    </div>
  );
};
