import { IconExternalLink } from '@tabler/icons-react';
import { Badge, Button, TActivityRowProps } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

const formatFormFieldValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) return value.map(formatFormFieldValue).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

type TFormSubmissionField = {
  label: string;
  value: unknown;
};

export const FormSubmissionActivityRow = ({ activity }: TActivityRowProps) => {
  const { t } = useTranslation('frontline');
  const { formTitle, submissions = [], conversationId } =
    activity.metadata || {};
  const fields = submissions as TFormSubmissionField[];

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex flex-wrap items-center gap-1">
        <span className="text-accent-foreground">
          {t('created-from-conversation-form', {
            defaultValue: 'created this from a conversation form',
          })}
        </span>
        {formTitle && (
          <Badge variant="secondary" className="font-medium">
            {String(formTitle)}
          </Badge>
        )}
        {conversationId && (
          <Button variant="link" size="sm" asChild>
            <Link to={`/frontline/inbox?conversationId=${conversationId}`}>
              {t('view-conversation')}
              <IconExternalLink />
            </Link>
          </Button>
        )}
      </div>
      {fields.length > 0 && (
        <div className="border rounded-lg px-4 py-3 mt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map((field, index) => (
            <div key={index} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                {field.label}
              </span>
              <div className="border rounded-md px-3 py-2 text-sm bg-muted/30 wrap-break-word">
                {formatFormFieldValue(field.value)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
