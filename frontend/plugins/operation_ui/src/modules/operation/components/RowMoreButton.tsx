import { ButtonProps, RecordTable } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const RowMoreButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, 'name'> & { name?: string | null }
>(({ name, ...props }, ref) => {
  const { t } = useTranslation('operation');

  return (
    <RecordTable.MoreButton
      ref={ref}
      className="w-full h-full"
      aria-label={t('actions-for', {
        name,
        defaultValue: 'Actions for {{name}}',
      })}
      {...props}
    />
  );
});

RowMoreButton.displayName = 'RowMoreButton';
