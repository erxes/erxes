import { IconPlus } from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const VisitedPageTabsNewButton = ({
  onClick,
}: Readonly<{
  onClick: () => void;
}>) => {
  const { t } = useTranslation('common');
  const label = t('navigation.new-tab', { defaultValue: 'New tab' });

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          aria-label={label}
          className="size-6 shrink-0 rounded-md text-muted-foreground"
          onClick={onClick}
          size="icon"
          type="button"
          variant="ghost"
        >
          <IconPlus className="size-3.5" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom">{label}</Tooltip.Content>
    </Tooltip>
  );
};
