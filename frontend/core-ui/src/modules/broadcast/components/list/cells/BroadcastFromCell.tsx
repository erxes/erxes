import { RecordTableInlineCell } from 'erxes-ui';
import { MembersInline } from 'ui-modules';
import { BROADCAST_METHODS } from '../../../constants';
import { useTranslation } from 'react-i18next';

export const BroadcastFromCell = ({
  method,
  fromEmail,
  fromUserId,
}: {
  method?: string;
  fromEmail?: string;
  fromUserId?: string;
}) => {
  const { t } = useTranslation('broadcasts');

  // Only an email campaign is sent from somebody; the other methods leave this
  // empty rather than claiming a member is missing.
  if (method !== BROADCAST_METHODS.EMAIL) {
    return (
      <RecordTableInlineCell className="text-muted-foreground">
        —
      </RecordTableInlineCell>
    );
  }

  return (
    <RecordTableInlineCell>
      {fromEmail ? (
        fromEmail
      ) : (
        <MembersInline
          memberIds={[fromUserId as string]}
          placeholder={t('columns.no-member')}
        />
      )}
    </RecordTableInlineCell>
  );
};
