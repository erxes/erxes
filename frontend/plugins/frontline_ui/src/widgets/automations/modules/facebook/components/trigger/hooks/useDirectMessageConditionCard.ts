import { useState } from 'react';
import { generateAutomationElementId } from 'ui-modules';
import { TMessageTriggerDirectConditions } from '../types/messageTrigger';

export const useDirectMessageConditionCard = ({
  condition,
  isKeywordBlocked,
  onChange,
}: {
  condition: TMessageTriggerDirectConditions[number];
  // A keyword an active automation already answers cannot be added here.
  isKeywordBlocked?: (text: string) => boolean;
  onChange: (
    name: 'operator' | 'keywords',
    value:
      | TMessageTriggerDirectConditions[number]['keywords']
      | TMessageTriggerDirectConditions[number]['operator'],
  ) => void;
}) => {
  // Held here so the keyword can be checked against other automations before
  // it is committed, not after.
  const [draftKeyword, setDraftKeyword] = useState('');

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') {
      return;
    }

    const text = draftKeyword.trim();

    if (!text || isKeywordBlocked?.(text)) {
      return;
    }

    onChange('keywords', [
      ...condition.keywords,
      { _id: generateAutomationElementId(), text },
    ]);

    setDraftKeyword('');
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
    draftKeyword,
    setDraftKeyword,
    handleKeyPress,
    onRemoveConditionKeyword,
    onChangeKeyword,
    toggleKeywordState,
    handleBlur,
  };
};
