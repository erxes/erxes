import { useTranslation } from 'react-i18next';
import { IconBookmarksFilled } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';

export const ContactsBreadcrumb = () => {
  const { t } = useTranslation('contact');
  return (
    <>
      <Button variant="ghost">
        <IconBookmarksFilled />
        {t('contacts')}
      </Button>
      <Separator.Inline />
    </>
  );
};
