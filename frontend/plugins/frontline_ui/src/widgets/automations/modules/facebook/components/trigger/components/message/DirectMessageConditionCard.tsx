import { IconSquareKey, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Input, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DIRECT_MESSAGE_OPERATOR_TYPES } from '../../constants/messageTriggerOptions';
import { useDirectMessageConditionCard } from '../../hooks/useDirectMessageConditionCard';
import {
  TTriggerClaim,
  normalizeKeyword,
} from '../../hooks/useFacebookBotTriggerClaims';
import { TMessageTriggerDirectConditions } from '../../types/messageTrigger';
import { TriggerClaimNote } from './TriggerClaimNote';

export const DirectMessageConditionCard = ({
  condition,
  keywordClaims,
  onChange,
  onRemove,
}: {
  condition: TMessageTriggerDirectConditions[number];
  keywordClaims?: Record<string, TTriggerClaim[]>;
  onChange: (
    name: 'operator' | 'keywords',
    value:
      | TMessageTriggerDirectConditions[number]['keywords']
      | TMessageTriggerDirectConditions[number]['operator'],
  ) => void;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const {
    hasKeywords,
    draftKeyword,
    setDraftKeyword,
    handleKeyPress,
    onRemoveConditionKeyword,
    onChangeKeyword,
    toggleKeywordState,
    handleBlur,
  } = useDirectMessageConditionCard({
    condition,
    isKeywordBlocked: (text) =>
      Boolean(keywordClaims?.[normalizeKeyword(text)]?.length),
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
            <Select.Value placeholder={t('select')} />
          </Select.Trigger>
          <Select.Content>
            {DIRECT_MESSAGE_OPERATOR_TYPES.map(({ label, value }) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>

        <Input
          placeholder={t('add-keyword')}
          value={draftKeyword}
          onChange={(event) => setDraftKeyword(event.currentTarget.value)}
          onKeyDown={handleKeyPress}
        />
        <TriggerClaimNote
          claims={keywordClaims?.[normalizeKeyword(draftKeyword)]}
        />

        {!hasKeywords ? (
          <div className="flex flex-col items-center text-muted-foreground">
            <IconSquareKey />
            <span className="text-xs">{t('no-keywords-configured')}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 py-4">
            <div className="flex flex-wrap gap-4">
              {(condition.keywords || []).map(({ _id, text, isEditing }) => (
                <Badge
                  key={_id}
                  id={_id}
                  variant={
                    keywordClaims?.[normalizeKeyword(text || '')]?.length
                      ? 'warning'
                      : 'default'
                  }
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
            {(condition.keywords || []).map(({ _id, text }) => (
              <TriggerClaimNote
                key={`${_id}-claim`}
                claims={keywordClaims?.[normalizeKeyword(text || '')]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
