import { Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectTags } from 'ui-modules';
import { SelectDateTicket } from '@/ticket/components/ticket-selects/SelectDateTicket';
import { SelectPriorityTicket } from '@/ticket/components/ticket-selects/SelectPriorityTicket';
import { ConversationConvertType } from '@/inbox/conversations/types/conversationConvert';
import { ConvertField } from './ConvertFields';
import {
  CONVERT_TYPE_OPTIONS,
  TConvertFormReturn,
  TConvertSystemFieldKey,
} from './convertForm';

export const ConvertSystemFields = ({
  type,
  form,
  shownKeys,
  requiredKeys,
}: {
  type: ConversationConvertType;
  form: TConvertFormReturn;
  shownKeys: TConvertSystemFieldKey[];
  requiredKeys: TConvertSystemFieldKey[];
}) => {
  const { t } = useTranslation('frontline');

  if (!shownKeys.length) {
    return null;
  }

  const isShown = (key: TConvertSystemFieldKey) => shownKeys.includes(key);
  const isRequired = (key: TConvertSystemFieldKey) =>
    requiredKeys.includes(key);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {isShown('priority') && (
        <Form.Field
          name="priority"
          control={form.control}
          render={({ field }) => (
            <ConvertField
              label={t('priority-label', 'Priority')}
              required={isRequired('priority')}
            >
              <SelectPriorityTicket.FormItem
                value={field.value ?? 0}
                onValueChange={field.onChange}
              />
            </ConvertField>
          )}
        />
      )}
      {isShown('tagIds') && (
        <Form.Field
          name="tagIds"
          control={form.control}
          render={({ field }) => (
            <ConvertField
              label={t('tags-label', 'Tags')}
              required={isRequired('tagIds')}
            >
              <SelectTags.FormItem
                tagType={CONVERT_TYPE_OPTIONS[type].propertyContentType}
                scope={`frontline-convert-${type}-tags`}
                mode="multiple"
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(Array.isArray(value) ? value : [value])
                }
              />
            </ConvertField>
          )}
        />
      )}
      {isShown('startDate') && (
        <Form.Field
          name="startDate"
          control={form.control}
          render={({ field }) => (
            <ConvertField
              label={t('start-date-label', 'Start Date')}
              required={isRequired('startDate')}
            >
              <SelectDateTicket.FormItem
                value={field.value}
                placeholder={t('start-date-label', 'Start Date')}
                onValueChange={field.onChange}
              />
            </ConvertField>
          )}
        />
      )}
      {isShown('closeDate') && (
        <Form.Field
          name="closeDate"
          control={form.control}
          render={({ field }) => (
            <ConvertField
              label={t('due-date-label', 'Due Date')}
              required={isRequired('closeDate')}
            >
              <SelectDateTicket.FormItem
                value={field.value}
                placeholder={t('due-date-label', 'Due Date')}
                onValueChange={field.onChange}
              />
            </ConvertField>
          )}
        />
      )}
    </div>
  );
};
