import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface MoreOptionsButtonProps {
  showMore: boolean;
  onToggle: () => void;
}

export const MoreOptionsButton = ({
  showMore,
  onToggle,
}: MoreOptionsButtonProps) => {
  const { t } = useTranslation('sales');
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onToggle}
      className="mx-auto flex w-fit items-center justify-center gap-1 text-muted-foreground"
    >
      {showMore ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      {showMore ? t('hide-more-options') : t('more-options')}
    </Button>
  );
};
