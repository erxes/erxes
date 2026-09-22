import { useApolloClient } from '@apollo/client';
import { useCallback, useState } from 'react';
import { useSegment } from '../context/SegmentProvider';
import { SEGMENT_SAME_DEFINITION } from '../graphql/queries';
import { ISegment } from '../types';

type Duplicate = Pick<ISegment, '_id' | 'name'>;

export const useSegmentSaveGuard = ({
  onConfirm,
  onOpenExisting,
}: {
  onConfirm: () => void;
  onOpenExisting?: (segmentId: string) => void;
}) => {
  const { form, segment, contentType } = useSegment();
  const client = useApolloClient();

  const [duplicate, setDuplicate] = useState<Duplicate | null>(null);
  const [pendingRebuild, setPendingRebuild] = useState(false);
  const [checking, setChecking] = useState(false);

  const members = segment?.membersCount ?? 0;

  const requestSave = useCallback(async () => {
    setChecking(true);

    let asking: Duplicate | null = null;

    try {
      const { data } = await client.query<{
        segmentSameDefinition: Duplicate | null;
      }>({
        query: SEGMENT_SAME_DEFINITION,
        variables: { contentType, root: form.getValues('root') },
        fetchPolicy: 'network-only',
      });

      asking = data?.segmentSameDefinition || null;
    } finally {
      setChecking(false);
    }

    if (asking && asking._id !== segment?._id) {
      setDuplicate(asking);
      return;
    }

    const definitionChanged = !asking;

    if (members > 0 && definitionChanged) {
      setPendingRebuild(true);
      return;
    }

    onConfirm();
  }, [client, contentType, form, segment, members, onConfirm]);

  return {
    duplicate,
    dismissDuplicate: useCallback(() => setDuplicate(null), []),
    openExisting: useCallback(() => {
      if (duplicate) {
        onOpenExisting?.(duplicate._id);
      }

      setDuplicate(null);
    }, [duplicate, onOpenExisting]),

    pendingRebuild,
    members,
    confirmRebuild: useCallback(() => {
      setPendingRebuild(false);
      onConfirm();
    }, [onConfirm]),
    cancelRebuild: useCallback(() => setPendingRebuild(false), []),

    checking,
    requestSave,
  };
};
