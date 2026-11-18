import { SendEmailEmailContentBuilder } from '@/automations/components/builder/nodes/actions/sendEmail/components/SendEmailEmailContentBuilder';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import {
  TEmailContentAnswer,
  useEmailContentRequirement,
} from '@/automations/components/builder/template/useEmailContentRequirement';
import { IconCheck } from '@tabler/icons-react';
import { Button, Input } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

// Campaign and template emails go to a customer
const EMAIL_RECORD_TYPE = 'core:contacts.customers';

/** An email step's subject and body, written before the template installs. */
export const EmailContentRequirement = ({
  value,
  defaultValue,
  variableSourceNodes = [],
  onChange,
}: {
  value: unknown;
  defaultValue?: Partial<TEmailContentAnswer>;
  // Its journey's trigger, so `{{ trigger.* }}` can be inserted while writing
  variableSourceNodes?: TAutomationVariableSourceNode[];
  onChange: (value: TEmailContentAnswer | null) => void;
}) => {
  const { t } = useTranslation('automations');
  const { form, subject, content, canUse, isUsed, use } =
    useEmailContentRequirement({ value, defaultValue, onChange });

  return (
    <FormProvider {...form}>
      <div className="space-y-2">
        <Input
          value={subject}
          placeholder={t('template-email-subject')}
          onChange={(event) =>
            form.setValue('subject', event.target.value, { shouldDirty: true })
          }
        />
        <SendEmailEmailContentBuilder
          content={content}
          contentType={EMAIL_RECORD_TYPE}
          variableSourceNodes={variableSourceNodes}
          onChange={(next) =>
            form.setValue('content', next, { shouldDirty: true })
          }
        />
        <Button
          type="button"
          variant={isUsed ? 'secondary' : 'default'}
          size="sm"
          disabled={!canUse || isUsed}
          onClick={use}
        >
          {isUsed && <IconCheck />}
          {isUsed ? t('template-email-used') : t('template-email-use')}
        </Button>
      </div>
    </FormProvider>
  );
};
