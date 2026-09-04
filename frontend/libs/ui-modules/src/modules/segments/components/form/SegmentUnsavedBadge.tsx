import { Badge } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { segmentFormDirtyAtom } from '../../states/segmentFormDirty';

export const SegmentUnsavedBadge = () => {
  const dirty = useAtomValue(segmentFormDirtyAtom);
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  if (!dirty) {
    return null;
  }

  return (
    <Badge variant="secondary" className="font-normal">
      {t('unsaved-changes')}
    </Badge>
  );
};
