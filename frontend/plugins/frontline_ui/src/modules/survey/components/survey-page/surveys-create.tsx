import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

const SurveysCreateButton: FC<React.ComponentProps<typeof Button>> = (
  props,
) => {
  const { t } = useTranslation('frontline');
  const { id: channelId } = useParams<{ id: string }>();

  return (
    <Button asChild {...props}>
      <Link to={`/settings/frontline/channels/${channelId}/surveys/create`}>
        <IconPlus />
        {t('create-survey', 'Create survey')}
      </Link>
    </Button>
  );
};

export { SurveysCreateButton };
