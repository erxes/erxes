import { useQuery } from '@apollo/client';
import { Checkbox, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MAIL_INBOXES_QUERY } from '../../graphql/mailInboxQueries';

interface MailInbox {
  _id: string;
  name?: string;
  address?: string;
}

interface MailInboxesResponse {
  mailInboxes: MailInbox[] | null;
}

interface MailInboxChecklistProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export const MailInboxChecklist = ({
  value,
  onChange,
}: MailInboxChecklistProps) => {
  const { t } = useTranslation('frontline');
  const { data, loading, error } =
    useQuery<MailInboxesResponse>(MAIL_INBOXES_QUERY);

  if (loading) {
    return <Spinner size="sm" />;
  }

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  const inboxes = data?.mailInboxes ?? [];

  if (!inboxes.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t(
          'mail-trigger-inboxes-empty',
          'No mail inbox is connected in the channels you can see.',
        )}
      </p>
    );
  }

  const toggle = (id: string, checked: boolean) =>
    onChange(checked ? [...value, id] : value.filter((entry) => entry !== id));

  return (
    <div className="space-y-2 rounded-md border p-3">
      {inboxes.map((inbox) => (
        <label
          key={inbox._id}
          className="flex cursor-pointer items-center gap-3 text-sm"
        >
          <Checkbox
            checked={value.includes(inbox._id)}
            onCheckedChange={(checked) => toggle(inbox._id, checked === true)}
          />
          <span className="min-w-0 flex-1 truncate">
            <span className="font-medium">{inbox.name || inbox.address}</span>
            {inbox.address && (
              <span className="ml-2 text-muted-foreground">
                {inbox.address}
              </span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
};
