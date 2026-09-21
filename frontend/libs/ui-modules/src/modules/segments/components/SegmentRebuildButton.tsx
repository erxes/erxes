import { IconRefresh } from '@tabler/icons-react';
import { AlertDialog, Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSegmentRebuild } from '../hooks/useSegmentRebuild';
import { ISegment } from '../types';

export const SegmentRebuildButton = ({
  segment,
  size,
}: {
  segment?: ISegment;
  size?: 'sm';
}) => {
  const { t } = useTranslation('segment', { keyPrefix: 'analytics' });
  const { rebuild, rebuilding } = useSegmentRebuild(segment?._id);
  const [asking, setAsking] = useState(false);

  if (!segment) {
    return null;
  }

  const members = segment.membersCount ?? 0;

  return (
    <>
      <Button
        variant="outline"
        size={size}
        type="button"
        onClick={() => setAsking(true)}
        disabled={rebuilding}
      >
        <IconRefresh className="size-4" />
        {t('rebuild')}
      </Button>

      <AlertDialog open={asking} onOpenChange={setAsking}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>{t('rebuild-confirm-title')}</AlertDialog.Title>
            <AlertDialog.Description>
              {t('rebuild-confirm-description', { count: members })}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>{t('cancel')}</AlertDialog.Cancel>
            <AlertDialog.Action
              onClick={() => {
                setAsking(false);
                rebuild();
              }}
            >
              {t('rebuild')}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};
