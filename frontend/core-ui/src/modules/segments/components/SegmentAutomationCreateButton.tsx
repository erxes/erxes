import { useSegmentAutomationCreate } from '@/segments/hooks/useSegmentAutomationCreate';
import { IconBolt } from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ISegment } from 'ui-modules';

export const SegmentAutomationCreateButton = ({
  segment,
  size,
}: {
  segment?: ISegment;
  size?: 'sm';
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const { canCreate, loading, createAutomation } =
    useSegmentAutomationCreate(segment);

  if (loading || !segment) {
    return null;
  }

  const button = (
    <Button
      type="button"
      variant="outline"
      size={size}
      disabled={!canCreate}
      onClick={createAutomation}
    >
      <IconBolt className="size-4" />
      {t('automations-create')}
    </Button>
  );

  if (canCreate) {
    return button;
  }

  // A disabled button fires no hover, so the reason sits on its wrapper.
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <span>{button}</span>
      </Tooltip.Trigger>
      <Tooltip.Content>{t('automations-unsupported')}</Tooltip.Content>
    </Tooltip>
  );
};
