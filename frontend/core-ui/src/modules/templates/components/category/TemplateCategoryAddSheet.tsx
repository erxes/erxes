import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { TemplateCategorySheet } from './TemplateCategorySheet';
import { useTranslation } from 'react-i18next';

export const TemplateCategoryAddSheet = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'template-category' });

  return (
    <TemplateCategorySheet>
      <Button>
        <IconPlus />
        {t('category')}
      </Button>
    </TemplateCategorySheet>
  );
};
