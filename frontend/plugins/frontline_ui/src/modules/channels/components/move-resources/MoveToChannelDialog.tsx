import { useChannelMoveResources } from '@/channels/hooks/useChannelMoveResources';
import { useGetChannel } from '@/channels/hooks/useGetChannel';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { ChannelResourceType, IChannel } from '@/channels/types';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { IconArrowBarToRight } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Dialog,
  Popover,
  Skeleton,
  Spinner,
  toast,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const RESOURCE_LABELS: Record<
  ChannelResourceType,
  { key: string; one: string; many: string }
> = {
  [ChannelResourceType.INTEGRATION]: {
    key: 'move-resource-integration',
    one: 'integration',
    many: 'integrations',
  },
  [ChannelResourceType.PIPELINE]: {
    key: 'move-resource-pipeline',
    one: 'ticket pipeline',
    many: 'ticket pipelines',
  },
  [ChannelResourceType.FORM]: {
    key: 'move-resource-form',
    one: 'form',
    many: 'forms',
  },
  [ChannelResourceType.SURVEY]: {
    key: 'move-resource-survey',
    one: 'survey',
    many: 'surveys',
  },
  [ChannelResourceType.RESPONSE_TEMPLATE]: {
    key: 'move-resource-response-template',
    one: 'response template',
    many: 'response templates',
  },
};

export const MoveToChannelDialog = ({
  open,
  onOpenChange,
  resourceType,
  resourceIds,
  sourceChannelId,
  onMoved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: ChannelResourceType;
  resourceIds: string[];
  sourceChannelId: string;
  onMoved?: (movedIds: string[]) => void;
}) => {
  const { t } = useTranslation('frontline');
  const [targetChannelId, setTargetChannelId] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const { channel: sourceChannel, loading: sourceLoading } = useGetChannel({
    variables: { id: sourceChannelId },
    skip: !open || !sourceChannelId,
  });
  const { channels } = useGetChannels({ skip: !open });
  const { moveResources, loading } = useChannelMoveResources(resourceType);

  useEffect(() => {
    if (!open) {
      setTargetChannelId('');
      setPickerOpen(false);
    }
  }, [open]);

  const labels = RESOURCE_LABELS[resourceType];
  const count = resourceIds.length;
  const resourceLabel = t(labels.key, {
    defaultValue: count === 1 ? labels.one : labels.many,
    count,
  });

  const sourceChannelName = sourceChannel?.name || '';
  const targetChannelName =
    (channels || []).find(
      (channel: IChannel) => channel._id === targetChannelId,
    )?.name || '';

  const canMove =
    !!targetChannelId && targetChannelId !== sourceChannelId && count > 0;

  const handleMove = () => {
    if (!canMove) {
      return;
    }

    moveResources({
      variables: {
        resourceType,
        resourceIds,
        sourceChannelId,
        targetChannelId,
      },
      onCompleted: (data) => {
        const result = data?.channelMoveResources;

        toast({
          title: t('success', 'Success!'),
          variant: 'success',
          description: t('resources-moved-to-channel', {
            defaultValue: 'Moved {{count}} {{resource}} to {{channel}}',
            count: result?.movedCount ?? count,
            resource: resourceLabel,
            channel: result?.targetChannelName || targetChannelName,
          }),
        });

        onMoved?.(result?.movedIds || resourceIds);
        onOpenChange(false);
      },
      onError: (error) =>
        toast({
          title: t('error', 'Error'),
          variant: 'destructive',
          description: error.message,
        }),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('move-to-channel', 'Move to Channel')}</Dialog.Title>
          <Dialog.Description>
            {t('move-to-channel-description', {
              defaultValue:
                'Move {{count}} {{resource}} into another channel. Nothing else about them changes.',
              count,
              resource: resourceLabel,
            })}
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              {t('current-channel', 'Current channel')}
            </span>
            {sourceLoading && !sourceChannelName ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                {sourceChannelName || t('no-channel', 'No channel')}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              {t('select-destination-channel', 'Select destination channel')}
            </span>
            <SelectChannel.Provider
              mode="single"
              value={targetChannelId}
              onValueChange={(value) => {
                setTargetChannelId(value as string);
                setPickerOpen(false);
              }}
            >
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <Combobox.Trigger className="w-full">
                  <SelectChannel.Value
                    placeholder={t('select-channel', 'Select Channel')}
                  />
                </Combobox.Trigger>
                <Combobox.Content>
                  <SelectChannel.Content
                    excludeChannelIds={[sourceChannelId]}
                  />
                </Combobox.Content>
              </Popover>
            </SelectChannel.Provider>
          </div>

          {canMove && (
            <p className="text-sm text-muted-foreground">
              {t('confirm-move-to-channel', {
                defaultValue:
                  'Are you sure you want to move {{count}} {{resource}} to {{channel}}?',
                count,
                resource: resourceLabel,
                channel: targetChannelName,
              })}
            </p>
          )}
        </div>

        <Dialog.Footer>
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={!canMove || loading} onClick={handleMove}>
            {loading ? <Spinner size="sm" /> : <IconArrowBarToRight />}
            {count > 1
              ? t('move-n-items', {
                  defaultValue: 'Move {{count}} items',
                  count,
                })
              : t('move', 'Move')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
