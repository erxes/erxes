import { MoveToChannelDialog } from '@/channels/components/move-resources/MoveToChannelDialog';
import { ChannelResourceType } from '@/channels/types';
import { IconArrowBarToRight } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const MoveToChannelCommandBarButton = ({
  resourceType,
  resourceIds,
  sourceChannelIds,
  onMoved,
}: {
  resourceType: ChannelResourceType;
  resourceIds: string[];
  sourceChannelIds: string[];
  onMoved?: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  const distinctChannelIds = [...new Set(sourceChannelIds.filter(Boolean))];
  const sourceChannelId = distinctChannelIds[0] || '';
  const mixedChannels = distinctChannelIds.length > 1;
  const disabled = !resourceIds.length || !sourceChannelId || mixedChannels;

  return (
    <>
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => setOpen(true)}
        title={
          mixedChannels
            ? t(
                'move-to-channel-same-channel-only',
                'Select items from one channel to move them together.',
              )
            : undefined
        }
      >
        <IconArrowBarToRight />
        {t('move-to-channel', 'Move to Channel')}
      </Button>
      {sourceChannelId && (
        <MoveToChannelDialog
          open={open}
          onOpenChange={setOpen}
          resourceType={resourceType}
          resourceIds={resourceIds}
          sourceChannelId={sourceChannelId}
          onMoved={onMoved}
        />
      )}
    </>
  );
};
