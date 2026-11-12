import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { INVITE_ROW_DEFAULTS, type IUserEntry } from './inviteSchema';

export const AddInviteRowButton = ({
  append,
}: {
  append: (entry: IUserEntry | IUserEntry[]) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <>
      <Button
        variant="secondary"
        className="bg-border"
        onClick={() => append({ ...INVITE_ROW_DEFAULTS })}
      >
        <IconPlus />
        {t('add-invite')}
      </Button>
      <Button
        variant="secondary"
        className="bg-border"
        onClick={() =>
          append([
            { ...INVITE_ROW_DEFAULTS },
            { ...INVITE_ROW_DEFAULTS },
            { ...INVITE_ROW_DEFAULTS },
          ])
        }
      >
        <IconPlus />
        {t('add-multiple-invites')}
      </Button>
    </>
  );
};
