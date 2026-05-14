import { IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { TemplateCategorySheet } from './TemplateCategorySheet';

export const TemplateCategoryAddSheet = () => {
  return (
    <TemplateCategorySheet>
      <Button>
        <IconPlus />
        Category
      </Button>
    </TemplateCategorySheet>
  );
};
