import { Button } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FormsCreateButton: FC<React.ComponentProps<typeof Button>> = (props) => {
  const { t } = useTranslation('frontline');
  const { id: channelId } = useParams<{ id: string }>();
  return (
    <Button asChild {...props}>
      <Link to={`/settings/frontline/channels/${channelId}/forms/create`}>
        <IconPlus />
        {t('create-form')}
      </Link>
    </Button>
  );
};
export { FormsCreateButton };
