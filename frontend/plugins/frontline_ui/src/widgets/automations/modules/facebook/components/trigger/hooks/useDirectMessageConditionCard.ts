import { generateAutomationElementId } from 'ui-modules';
import { TMessageTriggerDirectConditions } from '../types/messageTrigger';

export const useDirectMessageConditionCard = ({
  condition,
  onChange,
}: {
  condition: TMessageTriggerDirectConditions[number];
  onChange: (
    name: 'operator' | 'keywords',
    value:
      | TMessageTriggerDirectConditions[number]['keywords']
      | TMessageTriggerDirectConditions[number]['operator'],
  ) => void;
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return;
    }

    const { value } = e.currentTarget;

    onChange('keywords', [
      ...condition.keywords,
      { _id: generateAutomationElementId(), text: value },
    ]);

    e.currentTarget.value = '';
  };

  const onRemoveConditionKeyword = (_id: string) => {
    onChange(
      'keywords',
      condition.keywords.filter((keyword) => keyword._id !== _id),
    );
  };

  const onChangeKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { id, value } = e.currentTarget;

    if (e.key !== 'Enter') {
      return;
    }

    onChange(
      'keywords',
      condition.keywords.map((keyword) =>
        keyword._id === id
          ? { ...keyword, text: value, isEditing: false }
          : keyword,
      ),
    );
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
    const { id } = e.currentTarget;

    onChange(
      'keywords',
      condition.keywords.map((keyword) =>
        keyword._id === id ? { ...keyword, isEditing: false } : keyword,
      ),
    );
  };

  return {
    hasKeywords: condition.keywords.length > 0,
    handleKeyPress,
    onRemoveConditionKeyword,
    onChangeKeyword,
    toggleKeywordState,
    handleBlur,
  };
};
