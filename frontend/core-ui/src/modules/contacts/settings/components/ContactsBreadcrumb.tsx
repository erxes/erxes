import { useTranslation } from 'react-i18next';
import { IconBookmarksFilled } from '@tabler/icons-react';
import { Button, Separator } from 'erxes-ui';

export const ContactsBreadcrumb = () => {
  const { t } = useTranslation('contact');
  return (
    <>
      <Button variant="ghost" className="font-semibold">
        <IconBookmarksFilled className="w-4 h-4 text-accent-foreground" />
        {t('contacts', 'Contacts')}
      </Button>
      <Separator.Inline />
    </>
  );
};
