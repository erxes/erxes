import { useApolloClient } from '@apollo/client';
import { useCallback, useState } from 'react';
import { useSegment } from '../context/SegmentProvider';
import { SEGMENT_SAME_DEFINITION } from '../graphql/queries';
import { ISegment } from '../types';

/**
 * What has to be settled before a save goes through.
 *
 * Two different things, in order. A definition that already exists elsewhere
 * is answered with that segment rather than a second one - a duplicate is the
 * same work done twice, evaluated and written on every change for one answer,
 * so there is no "save anyway" to click past. A definition that changed on a
 * segment with members queues a rebuild, which empties it until that finishes,
 * and is worth a word first.
 */

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

  // Compared against the saved tree rather than the form's dirty state, which
  // marks a field touched even when it ends up back where it started.
  const definitionChanged = useCallback(
    () =>
      Boolean(segment) &&
      JSON.stringify(form.getValues('root')) !== JSON.stringify(segment?.root),
    [form, segment],
  );

  const requestSave = useCallback(async () => {
    setChecking(true);

    try {
      // Asked fresh every time: another tab may have saved the same definition
      // since this form was opened.
      const { data } = await client.query<{
        segmentSameDefinition: Duplicate | null;
      }>({
        query: SEGMENT_SAME_DEFINITION,
        variables: {
          contentType,
          root: form.getValues('root'),
          excludeId: segment?._id,
        },
        fetchPolicy: 'network-only',
      });

      if (data?.segmentSameDefinition) {
        setDuplicate(data.segmentSameDefinition);
        return;
      }
    } finally {
      setChecking(false);
    }

    if (members > 0 && definitionChanged()) {
      setPendingRebuild(true);
      return;
    }

    onConfirm();
  }, [
    client,
    contentType,
    form,
    segment,
    members,
    definitionChanged,
    onConfirm,
  ]);

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
