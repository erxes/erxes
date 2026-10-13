import { useSegmentBroadcastCreate } from '@/segments/hooks/useSegmentBroadcastCreate';
import { IconSend } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ISegment } from 'ui-modules';

/** Only for a segment the clock moves: there is a nightly refresh to follow. */
export const SegmentBroadcastCreateButton = ({
  segment,
}: {
  segment?: ISegment;
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });
  const { canCreate, createBroadcast } = useSegmentBroadcastCreate(segment);

  if (!canCreate) {
    return null;
  }

  return (
    <Button type="button" variant="outline" onClick={createBroadcast}>
      <IconSend className="size-4" />
      {t('broadcast-create')}
    </Button>
  );
};
