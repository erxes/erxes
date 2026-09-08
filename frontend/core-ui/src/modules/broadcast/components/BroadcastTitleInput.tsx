import { cn, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';

export const BroadcastTitleInput = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const { t } = useTranslation('broadcasts', { keyPrefix: 'composer' });

  return (
    <Sheet.Title asChild>
      <input
        {...register('title', { required: true })}
        placeholder={t('titlePlaceholder')}
        className={cn(
          'text-lg font-semibold text-foreground leading-none bg-transparent border-none outline-none focus-visible:ring-0 w-full placeholder:text-muted-foreground/70',
          errors.title && 'placeholder:text-destructive',
        )}
      />
    </Sheet.Title>
  );
};
