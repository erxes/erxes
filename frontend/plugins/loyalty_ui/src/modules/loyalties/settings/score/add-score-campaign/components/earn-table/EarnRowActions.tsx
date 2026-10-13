import { IconBolt, IconDots, IconTrash } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LoyaltyScoreFormValues } from '../../../constants/formSchema';
import { useEarnRowAutomation } from '../../hooks/useEarnRowAutomation';

export const EarnRowActions = ({
  form,
  index,
  onRemove,
}: {
  form: UseFormReturn<LoyaltyScoreFormValues>;
  index: number;
  onRemove: () => void;
}) => {
  const { t } = useTranslation('loyalty');
  const { visible, ready, create } = useEarnRowAutomation(form, index);

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7"
          aria-label={t('more')}
        >
          <IconDots />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-56">
        {visible && (
          <>
            <DropdownMenu.Item disabled={!ready} onSelect={create}>
              <IconBolt />
              {ready
                ? t('score-campaign-point-automation-create')
                : t('score-campaign-point-automation-save-first')}
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
          </>
        )}
        <DropdownMenu.Item className="text-destructive" onSelect={onRemove}>
          <IconTrash />
          {t('delete')}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
