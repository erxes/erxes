import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TemplateCategorySheet } from './TemplateCategorySheet';

export const TemplateCategoryAddSheet = () => {
  const { t } = useTranslation('templates');
  return (
    <TemplateCategorySheet>
      <Button>
        <IconPlus />
        {t('category-label', 'Category')}
      </Button>
    </TemplateCategorySheet>
  );
};
